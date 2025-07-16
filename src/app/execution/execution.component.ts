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
  EpicEstimateBean,
  Release,
  ReleaseDetailBean, ReleaseStatusEnum, TimeLogging
} from '../models/planning';
import {EpicService} from '../services/epic.service';
import {Priority, Role, SubComponent} from '../models/basic';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {PriorityService} from '../services/priority.service';
import {SubComponentService} from '../services/sub-component.service';
import {RoleService} from '../services/role.service';
import {EpicEstimateService} from '../services/epic-estimate.service';
import {WorkingHourEnum} from '../services/leave.service';
import {EpicEstimateComponent} from '../planning/epic-estimate.component';
import { MatDialog } from '@angular/material/dialog';
import {EpicComponent} from '../planning/epic.component';
import {PlanningDashboardService} from '../services/planning-dashboard.service';
import {ReleaseService} from '../services/release.service';
import {DecimalToTimePipe} from '../pipes/decimal.to.time';
import {EpicAssignmentService} from '../services/epic.assignment.service';
import {TimeLoggingService} from '../services/time.logging.service';
import {convertToMinutes, getLocalDate, releaseStatusClass} from '../utils/helper';
import {TruncateNumberPipe} from "../pipes/truncate.number";
@Component({
  selector: 'app-planning',
  standalone: true,
    imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
        NgxDatatableModule, EpicEstimateComponent, RouterLink, DecimalToTimePipe, TruncateNumberPipe], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './execution.component.html',
  styleUrl: './execution.component.css',
  providers: [BsModalService]
})
export class ExecutionComponent implements OnInit {
  modalRef?: BsModalRef;

  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  roles: Role[] = [];

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
  releaseService = inject(ReleaseService)
  epicAssignmentService = inject(EpicAssignmentService)
  timeLoggingService = inject(TimeLoggingService)
  timeLogging: TimeLogging = new TimeLogging();
  selectedEpicAssignment : EpicAssignmentBean = new EpicAssignmentBean();
  timeLogged: string = '';
  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog,
              private viewportScroller: ViewportScroller) {
    this.companyId = this.util.getCompanyId();
    this.productId = this.util.getSelectedProductId();//Number(this.route.snapshot.paramMap.get('productId'));
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadReleases();
    this.loadMetadata();
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
    this.roleService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.roles = data._embedded.roles;
        this.roles.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  closeRelease(releaseDetail: ReleaseDetailBean) {
    console.log('Planning it:'+releaseDetail.release?.name);
    if (releaseDetail.release) {
      this.releaseService.updateSpecificFieldsPasses(releaseDetail.release.id, {status: ReleaseStatusEnum.COMPLETED}).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Release is closed.');
          this.releases = this.releases.filter(wh => wh.release?.id !== releaseDetail.release?.id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }
  loadReleases(): void {
    this.planningService.getStartedReleasesByProductId(this.productId).subscribe({
      next: (data) => {
        console.log(data);
        this.releases = data;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  changeAssignmentStatus(assignment: EpicAssignmentBean, status: EpicAssignmentStatusEnum) {

    this.epicAssignmentService.updateSpecificFieldsPasses(assignment.id, {status:status}).subscribe({
      next: (data) => {
        assignment.status = data.status;
        this.util.showSuccessMessage('Status is updated to '+data.status);
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  updateTimeLoggingModal(template: TemplateRef<any>, releaseId: any, assignment: EpicAssignmentBean) {
    this.timeLogged = '';
    this.selectedEpicAssignment = assignment;
    this.timeLogging = new TimeLogging();
    this.timeLogging.epicId = assignment.epicId;
    this.timeLogging.resourceId = assignment.resourceId;
    this.timeLogging.releaseId = releaseId;
    this.timeLogging.loggedForDate = getLocalDate();
    this.modalRef = this.modalService.show(template);
  }

  addTimeLogging() {
    this.timeLogging.active=true;
    this.timeLogging.minutes= convertToMinutes(this.timeLogged);
    //this.editEpic.raisedByResourceId = this.au;
    return this.timeLoggingService.create(this.timeLogging).subscribe({
      next: (data) => {
        if (this.selectedEpicAssignment) {
          this.selectedEpicAssignment.minutesLogged += this.timeLogging.minutes;
          var releaseDetailBean = this.releases.find(r=> r.release?.id==this.timeLogging.releaseId );
          if (releaseDetailBean) {
            var rCap = releaseDetailBean.resourceCaps.find(rr=>rr.resourceId==this.timeLogging.resourceId);
            if (rCap) {
              rCap.loggedTime += this.timeLogging.minutes;
            }
          }
        }
        this.util.showSuccessMessage('Time logging is added.');
        this.timeLogging = new TimeLogging();
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  // Helper method to return the correct API observable

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
    this.epicService.updateSpecificFieldsPasses(epic.id, {priorityId:priority.id}).subscribe({
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



  // Close modal
  closeModal() {
    this.modalRef?.hide();
  }


  openDialogForEpic(epic: EpicBean): void {
    console.log("Planning epic:"+epic);
    const dialogRef = this.dialog.open(EpicComponent, {
      width: '80%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { epicBean: epic, priorities: this.priorities, subComponents: this.subComponents },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.epic && result.epic.id>0) {
        console.log('The dialog was closed:'+result.epic.title);
        let epic = result.epic;
        console.log('The dialog was closed:'+epic.id);
        console.log('The dialog was closed:'+this.unplannedEpics.filter(ep => ep.id === epic.id));
        const index = this.unplannedEpics.findIndex(ep => ep.id === epic.id);
        if (index!== -1) {
          const exiting = this.unplannedEpics[index];
          EpicBeanCopyPasteUpdatedValues(epic, exiting);
        } else {
          console.log('The dialog was closed adding in List:'+result.epic);
          this.unplannedEpics = [...this.unplannedEpics, epic];
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
      data: { epicBean: row, roles: this.roles },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
       row.estimates = result.estimates;
      }
      // Handle the result here
    });
  }
  getLoggedPercentage(row: any): number {
    const total = row.prodBasedAssignableTime;
    if (!total || total <= 0) return 0;
    return (row.loggedTime / total) * 100;
  }
  protected readonly WorkingHourEnum = WorkingHourEnum;
  protected readonly EpicBean = EpicBean;
  protected readonly EpicAssignmentStatusEnum = EpicAssignmentStatusEnum;
  protected readonly releaseStatusClass = releaseStatusClass;
}
