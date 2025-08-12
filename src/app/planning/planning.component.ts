import {ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule, NgFor, NgIf, ViewportScroller} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Utils} from '../utils/utils';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {
  Epic, EpicAssignmentBean, EpicAssignmentStatusEnum,
  EpicBean,
  EpicBeanCopyPasteUpdatedValues,
  EpicEstimateBean, EpicLinkType,
  Release,
  ReleaseDetailBean, ReleaseStatusEnum
} from '../models/planning';
import {EpicService} from '../services/epic.service';
import {Priority, ResourceRightBean, Role, SubComponent} from '../models/basic';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {PriorityService} from '../services/priority.service';
import {SubComponentService} from '../services/sub-component.service';
import {RoleService} from '../services/role.service';
import {EpicEstimateService} from '../services/epic-estimate.service';
import {WorkingHourEnum} from '../services/leave.service';
import {EpicEstimateComponent} from './epic-estimate.component';
import { MatDialog } from '@angular/material/dialog';
import {EpicComponent} from './epic.component';
import {PlanningDashboardService} from '../services/planning-dashboard.service';
import {ReleaseService} from '../services/release.service';
import {
  assignmentStatusClass, assignmentStatusShow,
  convertToMinutes, estimateStatusClass,
  isManager,
  messageChange,
  relationData,
  releaseStatusClass,
  transformToDhM
} from '../utils/helper';
import {DecimalToTimePipe} from '../pipes/decimal.to.time';
import {TruncateNumberPipe} from '../pipes/truncate.number';
import {AuthService} from '../services/auth.service';
@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
    NgxDatatableModule, EpicEstimateComponent, RouterLink, DecimalToTimePipe, TruncateNumberPipe], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.css',
  providers: [BsModalService]
})
export class PlanningComponent implements OnInit {
  modalRef?: BsModalRef;

  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  //roles: Role[] = [];

  unplannedEpics: EpicBean[] = [];
  editEpic: EpicBean = new EpicBean();

  releases: ReleaseDetailBean[] = [];

  editEpicEstimates: EpicEstimateBean[] = [];


  companyId:number;
  productId:number;

  epicService: EpicService = inject(EpicService);
  priorityService = inject(PriorityService)
  subComponentService = inject(SubComponentService)
  roleService = inject(RoleService)
  planningService = inject(PlanningDashboardService)
  epicEstimateService: EpicEstimateService = inject(EpicEstimateService);
  releaseService = inject(ReleaseService)
  assignableRoles: Role[] = [];
  authService = inject(AuthService);
  rights  = new ResourceRightBean();
  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog,
              private viewportScroller: ViewportScroller) {
    this.companyId = this.util.getCompanyId();
    this.productId = this.util.getSelectedProductId();//Number(this.route.snapshot.paramMap.get('productId'));
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadUnplannedEpics();
    this.loadUnplannedReleases();
    this.loadMetadata();
    this.authService.getResourceRightsByProductId(this.productId).subscribe({
      next: (data) => {
        this.rights = data;
      },
      error: (err) => {this.util.showErrorMessage(err);},
    });
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  loadMetadata(): void {
    this.priorityService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.priorities = data._embedded.priorities;
        this.priorities.sort((a, b) => a.priorityLevel - b.priorityLevel);
        console.log('sorted pri:'+this.priorities[0].priorityLevel);
        console.log('sorted pri:'+this.priorities[this.priorities.length-1].priorityLevel);
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
    this.subComponentService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.subComponents = data._embedded.components;
        this.subComponents.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });


    this.roleService.getActiveNonSystemOnlyRolesByProductId(this.productId).subscribe({
      next: (data) => {
        this.assignableRoles = data._embedded.roles;
        this.assignableRoles = this.assignableRoles.filter(r=>!r.systemRole);
        this.assignableRoles.sort((a, b) => a.name.localeCompare(b.name));

      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  planRelease(releaseDetail: ReleaseDetailBean) {
    console.log('Planning it:'+releaseDetail.release?.name);
    if (releaseDetail.release) {
      this.releaseService.updateSpecificFieldsPasses(releaseDetail.release.id, {status: ReleaseStatusEnum.PLANNED}).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Release is planned.');
          this.releases = this.releases.filter(wh => wh.release?.id !== releaseDetail.release?.id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }
  loadUnplannedReleases(): void {
    this.planningService.getUnplannedReleasesByProductId(this.productId).subscribe({
      next: (data) => {
        console.log(data);
        this.releases = data;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  reloadReleases(releaseId: number): void {
    this.planningService.getReleaseDetailByReleaseId(releaseId).subscribe({
      next: (data) => {
        console.log(data);
        const index = this.releases.findIndex(r => r.release.id === releaseId);
        this.releases.splice(index, 1, data);
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }


  loadUnplannedEpics(): void {
    this.planningService.getUnplannedEpicBeansByProductId(this.companyId, this.productId).subscribe({
      next: (data) => {
        console.log(data);
        this.unplannedEpics = data;
        this.unplannedEpics.forEach(e=>this.showEstimatesForEdit(e));
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  // Helper method to return the correct API observable
  updateEpic() {
      this.epicService.update(this.editEpic.id,
        this.editEpic).subscribe({
        next: (data) => {
          const priority = this.priorities.find(p => p.id === data.priorityId)
            ?? new Priority();
          this.editEpic.priorityName = priority.name;
          this.editEpic.priorityLevel = priority.priorityLevel;
          const subComp = this.subComponents.find(p => p.id === data.componentId)
            ?? new SubComponent();
          this.editEpic.componentName = subComp.name;
          this.editEpic = new EpicBean();
          this.util.showSuccessMessage('Data is updated');
          this.closeModal();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }
  deleteEpic(id: number) {
    if (window.confirm("Are you sure you want to delete?")) {
        this.epicService.delete(id).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('Data is deleted');
            this.unplannedEpics = this.unplannedEpics.filter(wh => wh.id !== id);
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
    }
  }
  changePriorityToLower(epic:EpicBean) {
    const priority = this.priorities.find(p=>p.priorityLevel>epic.priorityLevel);
    if (priority) {
      console.log('Lower e:'+epic.priorityLevel);
      console.log('Lower n:'+priority.priorityLevel);
      this.updatePriority(epic, priority);
    }
  }
  showChangePriorityToLower(epic:EpicBean) {
    //console.log(' 1 Lower:'+epic.priorityLevel);
    const priority = this.priorities.find(p=>p.priorityLevel>epic.priorityLevel);
    //console.log(' 2 Lower:'+priority?.priorityLevel);
    return !!priority;
  }
  changePriorityToUpper(epic:EpicBean) {
    const higherPriorities = this.priorities.filter(p=>p.priorityLevel<epic.priorityLevel);
    if (higherPriorities && higherPriorities.length>0) {
      const priority = higherPriorities[higherPriorities.length-1];
      console.log('Upper e:'+epic.priorityLevel);
      console.log('Upper n:'+priority.priorityLevel);
      this.updatePriority(epic, priority);
    }
  }
  showChangePriorityToUpper(epic:EpicBean) {
    const priority = this.priorities.find(p=>p.priorityLevel<epic.priorityLevel);
    return !!priority;
  }
  updatePriority(epic: EpicBean, priority: Priority) {
    this.epicService.updateSpecificFields(epic.id, {priorityId:priority.id}).subscribe({
      next: (data) => {
        epic.priorityLevel = priority.priorityLevel;
        epic.priorityName = priority.name;
        epic.priorityId = priority.id;
        this.util.showSuccessMessage('Priority is updated');
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  rowIndex: number=0;
  getRowClass(row: any): string {
    this.rowIndex = this.rowIndex +1;
    return this.rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  }
  planEpic(epic: EpicBean) {
    if (window.confirm("Are you sure you want to plan it?")) {
      this.planningService.planEpic(epic.id).subscribe({
        next: (data) => {
          if (data.releaseToAddIn) {
            this.util.showSuccessMessage(`It is planned in release ${data.releaseToAddIn.name} starting from ${data.releaseToAddIn.startDate}.`);
            if (!epic.replicate) {
              this.unplannedEpics = this.unplannedEpics.filter(wh => wh.id !== epic.id);
            }
            this.reloadReleases(data.releaseToAddIn.id);
          }
        },
        error: (err) => {
          console.info('---------------------');
          console.error(err);
          this.util.showErrorMessage(err);},
      });
    }
  }

  unplanEpic(id: number, releaseId: number) {
    if (window.confirm("Are you sure you want to remove it from plan?")) {
      this.planningService.unplanEpic(id).subscribe({
        next: (data) => {
            this.util.showSuccessMessage(data.message);
          this.reloadReleases(releaseId);
          this.loadUnplannedEpics();
        },
        error: (err) => {
          console.info('---------------------');
          console.error(err);
          this.util.showErrorMessage(err);},
      });
    }
  }

  createEpic() {
      this.editEpic.active=true;
      this.editEpic.forcefullyAdded=false;
      this.editEpic.code='EpicCode';
      this.editEpic.releaseId=null;
      this.editEpic.productId = this.productId;
      //this.editEpic.raisedByResourceId = this.au;
      return this.epicService.create(this.editEpic).subscribe({
        next: (data) => {
          this.editEpic.id = data.id;
          const priority = this.priorities.find(p => p.id === data.priorityId)
            ?? new Priority();
          this.editEpic.priorityName = priority.name;
          this.editEpic.priorityLevel = priority.priorityLevel;
          const subComp = this.subComponents.find(p => p.id === data.componentId)
            ?? new SubComponent();
          this.editEpic.componentName = subComp.name;
          //this.unplannedEpics.push(this.editEpic);
          this.unplannedEpics = [...this.unplannedEpics, this.editEpic];
          this.editEpic = new EpicBean();
          this.util.showSuccessMessage('Data is inserted.');
          this.closeModal();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }



  // Open modal
  createEpicModal(template: TemplateRef<any>) {
    this.editEpic = new EpicBean();
    this.modalRef = this.modalService.show(template);
  }
  updateEpicModal(template: TemplateRef<any>, id: number) {
    if (id) {
      this.editEpic = this.unplannedEpics.find((x) => x.id === id)
        ?? new EpicBean();
      this.modalRef = this.modalService.show(template);
    }
  }
  // Close modal
  closeModal() {
    this.modalRef?.hide();
  }
  showEstimatesForEdit(epic:EpicBean): void {
    var epicEstimates: EpicEstimateBean[] = epic.estimates??[];
    if (!epic.estimates) {
      epic.estimates  =epicEstimates;
    }
    this.assignableRoles.forEach(r => {
      if (epicEstimates.find(e => e.roleId == r.id) === undefined) {
        let newB = new EpicEstimateBean();
        newB.roleName = r.name;
        console.log('EpicEstimate:' + newB.roleName);
        newB.roleId = r.id;
        newB.resources = 1;
        newB.estimate = 0;
        newB.estimateStr = '';
        newB.id = 0;
        newB.active = true;
        newB.epicId = epic.id;
        epicEstimates.push(newB);
      } else {
        console.log('EpicEstimate Found' + r.name)
      }
    });
    epicEstimates.forEach(e => {
      e.estimateStr = transformToDhM(e.estimate);
    });
    epic.estimates = this.filterEstimatesToShow(epicEstimates);
  }
  changeEstimateTime(estimateBean: EpicEstimateBean) {
    //estimateBean.estimateStr = estimateStr as string;
    if (estimateBean.estimateStr =='' || estimateBean.estimateStr == 'Invalid'){
      estimateBean.estimateStr = 'Invalid';
      return;
    }

    estimateBean.estimate = convertToMinutes(estimateBean.estimateStr);
    if (estimateBean.estimate<=0) {
      estimateBean.estimateStr = 'Invalid';
      return;
    }
    if (estimateBean.id == 0) {
      this.epicEstimateService.create(estimateBean).subscribe({
        next: (data) => {
          estimateBean.id = data.id;
          //estimateBean.estimate = data.estimate;
          //estimateBean.resources = data.resources;
          estimateBean.estimateStr = transformToDhM(data.estimate);
          this.util.showSuccessMessage('Estimate is added.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    } else {
      this.epicEstimateService.updateSpecificFieldsPasses(estimateBean.id, {estimate: estimateBean.estimate}).subscribe({
        next: (data) => {
          //estimateBean.estimate = data.estimate;
          //estimateBean.resources = data.resources;
          estimateBean.estimateStr = transformToDhM(data.estimate);
          this.util.showSuccessMessage('Estimate is updated.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }

  changeEstimateResources(estimateBean: EpicEstimateBean, resources: string) {
    if (parseInt(resources, 10)<1 || parseInt(resources, 10)>99) {
      estimateBean.resources =1;
      return;
    }
    estimateBean.resources = parseInt(resources, 10);

    if (estimateBean.resources==0) {
      estimateBean.estimateStr = "";
      estimateBean.estimate = convertToMinutes(estimateBean.estimateStr);
    }
    if (estimateBean.id == 0) {
      this.epicEstimateService.create(estimateBean).subscribe({
        next: (data) => {
          estimateBean.id = data.id;
          //estimateBean.estimate = data.estimate;
          //estimateBean.resources = data.resources;
          estimateBean.estimateStr = transformToDhM(data.estimate);
          this.util.showSuccessMessage('Estimate is added.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    } else {
      this.epicEstimateService.updateSpecificFieldsPasses(estimateBean.id,
        {resources: estimateBean.resources,
          estimate: estimateBean.estimate}).subscribe({
        next: (data) => {
          //estimateBean.estimate = data.estimate;
          //estimateBean.resources = data.resources;
          estimateBean.estimateStr = transformToDhM(data.estimate);
          this.util.showSuccessMessage('Estimate is updated.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }

  removeEstimate(epic: EpicBean, estimateBean: EpicEstimateBean) {
    estimateBean.estimateStr = '';
    estimateBean.estimate = 0;
    estimateBean.resources = 1;
    if (estimateBean.id == 0) {
      if (epic.estimates) {
        epic.estimates = epic.estimates.filter(e => e?.roleId !== estimateBean?.roleId);
        this.epicEstimateService.create(estimateBean).subscribe({
          next: (data) => {
            estimateBean.id = data.id;
            //estimateBean.estimate = data.estimate;
            //estimateBean.resources = data.resources;
            estimateBean.estimateStr = transformToDhM(data.estimate);
            this.util.showSuccessMessage('Estimate is added.');
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
      }
    } else {

      this.epicEstimateService.updateSpecificFieldsPasses(estimateBean.id, {estimate: estimateBean.estimate}).subscribe({
        next: (data) => {
          if (epic.estimates) {
            epic.estimates = epic.estimates.filter(e => e?.roleId !== estimateBean?.roleId);
          }
          //estimateBean.estimate = data.estimate;
          //estimateBean.resources = data.resources;
          estimateBean.estimateStr = transformToDhM(data.estimate);
          this.util.showSuccessMessage('Estimate is updated.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }

  }
  showEstimates(epicEstimates: EpicEstimateBean[]): string {
    if (epicEstimates && epicEstimates.length > 0) {
      return epicEstimates.filter(estimate=>estimate.estimate>0)
        .map(estimate => `${estimate.roleName}: ${transformToDhM(estimate.estimate)}
      ${estimate.resources==1?``:`with ${estimate.resources} resources`}`).join('<br/>');
    } else {
      return 'Provide estimates';
    }
  }
  showAssignments(assignments: EpicAssignmentBean[]): string {
    if (assignments && assignments.length > 0) {
      return assignments.map(estimate => `${estimate.resourceName}: ${transformToDhM(estimate.estimate)}`).join('<br/>');
    } else {
      return 'Missing';
    }
  }
  openDialogForNewEpic():void {
    let epic = new EpicBean();
    epic.productId = this.productId;
    epic.releaseId = null;
    this.openDialogForEpic(epic, 0);
  }
  openDialogForEpic(epic: EpicBean, releaseId: number): void {
    console.log("Planning epic:"+epic);
    const dialogRef = this.dialog.open(EpicComponent, {
      width: '100%',
      maxWidth: '90vw', // 90% of viewport width
      height: '100%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { epicBean: epic, priorities: this.priorities, subComponents: this.subComponents, releaseId: releaseId },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.epic && result.epic.id>0) {
        if (result.anythingChanged) {
          if (result.releaseId==0) {
            this.loadUnplannedEpics();
          } else {
            this.reloadReleases(releaseId);
          }
        }
      }
      // Handle the result here
    });
  }
  openDialogForEstimates(row: EpicBean): void {
    console.log("Planning estimates:"+row.estimates?.length);
    const dialogRef = this.dialog.open(EpicEstimateComponent, {
      width: '80%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { epicBean: row},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        row.estimates = result.estimates;
        if (row.estimates) {
          row.estimates = this.filterEstimatesToShow(row.estimates);
        }
      }
      // Handle the result here
    });
  }

  filterEstimatesToShow(estimates:EpicEstimateBean[]): EpicEstimateBean[] {
    return estimates.filter(e => e.id == 0 || e.estimate > 0);
  }

  getAssignedPercentage(row: any): number {
    const total = row.prodBasedAssignableTime;
    if (!total || total <= 0) return 0;
    return (row.prodBasedAssignedTime / total) * 100;
  }
  protected readonly WorkingHourEnum = WorkingHourEnum;
  protected readonly EpicBean = EpicBean;
  protected readonly releaseStatusClass = releaseStatusClass;
  protected readonly isManager = isManager;
  protected readonly relationData = relationData;
    protected readonly EpicLinkType = EpicLinkType;
  protected readonly messageChange = messageChange;
  protected readonly assignmentStatusClass = assignmentStatusClass;
  protected readonly assignmentStatusShow = assignmentStatusShow;
  protected readonly EpicAssignmentStatusEnum = EpicAssignmentStatusEnum;
  protected readonly estimateStatusClass = estimateStatusClass;
}
