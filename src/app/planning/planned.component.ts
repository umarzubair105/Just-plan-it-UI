import {ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule, NgFor, NgIf, ViewportScroller} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Utils} from '../utils/utils';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {
  Epic, EpicAssignmentBean,
  EpicBean,
  EpicBeanCopyPasteUpdatedValues,
  EpicEstimateBean,
  Release,
  ReleaseDetailBean, ReleaseStatusEnum
} from '../models/planning';
import {EpicService} from '../services/epic.service';
import {Priority, Role, SubComponent} from '../models/basic';
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
import {releaseStatusClass, transformToDhM} from '../utils/helper';
import {DecimalToTimePipe} from '../pipes/decimal.to.time';
@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
    NgxDatatableModule, EpicEstimateComponent, RouterLink, DecimalToTimePipe], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './planned.component.html',
  styleUrl: './planned.component.css',
  providers: [BsModalService]
})
export class PlannedComponent implements OnInit {
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

  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog,
              private viewportScroller: ViewportScroller) {
    this.companyId = this.util.getCompanyId();
    this.productId = this.util.getSelectedProductId();//Number(this.route.snapshot.paramMap.get('productId'));
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadMetadata();
    this.loadPlannedReleases();
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
  unplanRelease(releaseDetail: ReleaseDetailBean) {
    if (releaseDetail.release) {
      this.releaseService.updateSpecificFieldsPasses(releaseDetail.release.id, {status: ReleaseStatusEnum.UNPLANNED}).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Release is un planned.');
          this.releases = this.releases.filter(wh => wh.release?.id !== releaseDetail.release?.id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }

  startRelease(releaseDetail: ReleaseDetailBean) {
    if (releaseDetail.release) {
      this.releaseService.updateSpecificFieldsPasses(releaseDetail.release.id, {status: ReleaseStatusEnum.STARTED}).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Release is started to work upon.');
          this.releases = this.releases.filter(wh => wh.release?.id !== releaseDetail.release?.id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }
  loadPlannedReleases(): void {
    this.planningService.getPlannedReleasesByProductId(this.productId).subscribe({
      next: (data) => {
        console.log(data);
        this.releases = data;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
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
  getAssignedPercentage(row: any): number {
    const total = row.prodBasedAssignableTime;
    if (!total || total <= 0) return 0;
    return (row.prodBasedAssignedTime / total) * 100;
  }
  protected readonly WorkingHourEnum = WorkingHourEnum;
  protected readonly EpicBean = EpicBean;
  protected readonly releaseStatusClass = releaseStatusClass;
}
