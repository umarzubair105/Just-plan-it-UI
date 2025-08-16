import {ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule, NgFor, NgIf, ViewportScroller} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Utils} from '../utils/utils';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {
  EntityType,
  Epic, EpicAssignmentBean, EpicAssignmentStatusEnum,
  EpicBean,
  EpicBeanCopyPasteUpdatedValues,
  EpicEstimateBean, EpicLinkType,
  Release,
  ReleaseDetailBean, ReleaseStatusEnum, TimeLogging
} from '../models/planning';
import {EpicService} from '../services/epic.service';
import {Priority, ResourceRightBean, Role, SubComponent} from '../models/basic';
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
import {
  assignmentStatusClass, assignmentStatusShow,
  convertToMinutes, epicAssignmentStatusIconClass,
  getLocalDate, isDateOver,
  isManager, messageChange,
  relationData,
  releaseStatusClass
} from '../utils/helper';
import {TruncateNumberPipe} from "../pipes/truncate.number";
import {AuthService} from '../services/auth.service';
import {EntityDetailComponent} from '../planning/entity-detail.component';
@Component({
  selector: 'app-personal-dashboard',
  standalone: true,
    imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
        NgxDatatableModule, EpicEstimateComponent, RouterLink, DecimalToTimePipe, TruncateNumberPipe], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './personal-dashboard.component.html',
  styleUrl: './personal-dashboard.component.css',
  providers: [BsModalService]
})
export class PersonalDashboardComponent implements OnInit {
  modalRef?: BsModalRef;

  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  roles: Role[] = [];

  unplannedEpics: EpicBean[] = [];
  editEpic: EpicBean = new EpicBean();

  releases: ReleaseDetailBean[] = [];

  editEpicEstimates: EpicEstimateBean[] = [];


  companyId:number;
  resourceId:number;

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
  authService = inject(AuthService);
  rights  = new ResourceRightBean();
  selectedRelease: ReleaseDetailBean | null = null;
  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog,
              private viewportScroller: ViewportScroller) {
    this.companyId = this.util.getCompanyId();
    this.resourceId = this.util.getLoggedResourceId();
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadReleases();
    this.loadMetadata();
    this.authService.getResourceRights().subscribe({
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
    this.roleService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.roles = data._embedded.roles;
        this.roles.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  openDialogForEntityDetail(release: Release): void {
    const dialogRef = this.dialog.open(EntityDetailComponent, {
      width: '80%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { entityId: release.id, entityType: EntityType.RELEASE, entityName: release.name },
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
  completeRelease(releaseDetail: ReleaseDetailBean) {
    if (!isDateOver(releaseDetail.release.endDate)) {
      if (!window.confirm("Release end date yet to come. Still do you want to continue to complete it?")) {
        return;
      }
    }
    if (releaseDetail.release) {
      if (window.confirm("Are you sure you want to complete it?")) {
        this.releaseService.completeRelease(releaseDetail.release.id).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('Release is closed.');
            this.releases = this.releases.filter(wh => wh.release?.id !== releaseDetail.release?.id);
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
      }
    }
  }
  loadReleases(): void {
    this.planningService.getResourceDashboard(this.resourceId).subscribe({
      next: (data) => {
        console.log(data);
        this.releases = data;
        this.releases.forEach(r=>{
          r.epics.forEach(e=>this.toggleAssignmentsCheck(e));
        })
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
  changeAssignmentDeliveryDate(assignment: EpicAssignmentBean, newDate: string) {
    let dt: Date | null = null;
    if (newDate) {
      dt = new Date(newDate);
    }
    this.epicAssignmentService.updateSpecificFieldsPasses(assignment.id, {expectedDeliveryDate:dt}).subscribe({
      next: (data) => {
        if (data.expectedDeliveryDate) {
          assignment.expectedDeliveryDate = data.expectedDeliveryDate;
          this.util.showSuccessMessage('Due Date is updated to ' + data.expectedDeliveryDate+".");
        } else {
          assignment.expectedDeliveryDate = null;
          this.util.showSuccessMessage('Due Date is removed. ');
        }
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  updateTimeLoggingModal(template: TemplateRef<any>, releaseDB: ReleaseDetailBean, assignment: EpicAssignmentBean) {
    this.selectedRelease = releaseDB;
    this.timeLogged = '';
    this.selectedEpicAssignment = assignment;
    this.timeLogging = new TimeLogging();
    this.timeLogging.epicId = assignment.epicId;
    this.timeLogging.resourceId = assignment.resourceId;
    this.timeLogging.releaseId = releaseDB.release.id;
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



  // Close modal
  closeModal() {
    this.modalRef?.hide();
  }


  openDialogForEpic(epic: EpicBean): void {
    console.log("Planning epic:"+epic);
    const dialogRef = this.dialog.open(EpicComponent, {
      width: '100%',
      maxWidth: '90vw', // 90% of viewport width
      height: '100%',
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
  toggleAssignments(epic: EpicBean): void {
    epic.expanded = !epic.expanded;
  }

  toggleAssignmentsCheck(epic: EpicBean): void {
    if (epic.assignments) {
      if (epic.assignments.filter(a=>a.status!=EpicAssignmentStatusEnum.COMPLETED).length>0) {
        epic.expanded = true;
      } else {
        epic.expanded = false;
      }
    }
  }
  getLoggedPercentage(row: any): number {
    let total = row.prodBasedAssignableTime;
    if (total==0 && row.loggedTime>0) {
      // when 0 time is assigned Just to show Red bar
      total=1;
    }
    if (!total || total <= 0) return 0;
    return (row.loggedTime / total) * 100;
  }
  getLoggedPercentageAgainstEstimated(row: any): number {
    let total = row.prodBasedAssignedTime;
    if (total==0 && row.loggedTime>0) {
      // when 0 time is assigned Just to show Red bar
      total=1;
    }
    if (!total || total <= 0) return 0;
    return (row.loggedTime / total) * 100;
  }
  protected readonly WorkingHourEnum = WorkingHourEnum;
  protected readonly EpicBean = EpicBean;
  protected readonly EpicAssignmentStatusEnum = EpicAssignmentStatusEnum;
  protected readonly releaseStatusClass = releaseStatusClass;
    protected readonly isManager = isManager;
    protected readonly relationData = relationData;
    protected readonly EpicLinkType = EpicLinkType;
  protected readonly assignmentStatusClass = assignmentStatusClass;
  protected readonly assignmentStatusShow = assignmentStatusShow;
  protected readonly messageChange = messageChange;
  protected readonly isDateOver = isDateOver;
  protected readonly epicAssignmentStatusIconClass = epicAssignmentStatusIconClass;
}
