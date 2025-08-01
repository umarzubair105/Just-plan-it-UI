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
import {
  assignmentStatusClass,
  assignmentStatusShow,
  getLocalDate,
  messageChange,
  relationData,
  releaseStatusClass
} from '../utils/helper';
import {EntityDetailComponent} from '../planning/entity-detail.component';
@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
    NgxDatatableModule, EpicEstimateComponent, RouterLink, DecimalToTimePipe], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './executed.component.html',
  styleUrl: './executed.component.css',
  providers: [BsModalService]
})
export class ExecutedComponent implements OnInit {
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
  loadReleases(): void {
    this.planningService.getOldReleasesByProductId(this.productId).subscribe({
      next: (data) => {
        this.releases = data;
        this.releases.forEach(r=>{
          r.epics.forEach(e=>e.expanded=false);
        })
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  expand(releaseDetail: ReleaseDetailBean): void {
    let releaseId = releaseDetail.release?.id;
    if (releaseId) {
      if (!releaseDetail.epics) {
        this.planningService.getReleaseDetailByReleaseId(releaseId).subscribe({
          next: (data) => {
            releaseDetail.resourceCaps = data.resourceCaps;
            releaseDetail.epics = data.epics;
            releaseDetail.expanded = true;
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
      } else {
        releaseDetail.expanded = true;
      }
  }
  }
  openDialogForEntityDetail(release: Release): void {
    const dialogRef = this.dialog.open(EntityDetailComponent, {
      width: '50%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { entityId: release.id, entityType: EntityType.RELEASE, entityName: release.name },
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
  rowIndex: number=0;
  getRowClass(row: any): string {
    const epic = row as EpicBean;
    if (epic.assignments && epic.assignments.filter(a => a.status != EpicAssignmentStatusEnum.COMPLETED).length == 0){
      return 'completed-row';
    }
    this.rowIndex = this.rowIndex +1;
    return this.rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  }
  toggleAssignments(epic: EpicBean): void {
    epic.expanded = !epic.expanded;
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
  protected readonly relationData = relationData;
  protected readonly EpicLinkType = EpicLinkType;
  protected readonly messageChange = messageChange;
  protected readonly assignmentStatusShow = assignmentStatusShow;
  protected readonly assignmentStatusClass = assignmentStatusClass;
}
