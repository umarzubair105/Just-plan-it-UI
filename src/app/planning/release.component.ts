import {ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Utils} from '../utils/utils';
import {ActivatedRoute} from '@angular/router';
import {
  Epic, EpicAssignmentBean,
  EpicBean,
  EpicBeanCopyPasteUpdatedValues,
  EpicEstimateBean,
  Release,
  ReleaseDetailBean
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
@Component({
  selector: 'app-planned-release',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
    NgxDatatableModule, EpicEstimateComponent], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './release.component.html',
  styleUrl: './release.component.css',
  providers: [BsModalService]
})
export class ReleaseComponent implements OnInit {
  modalRef?: BsModalRef;

  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  releases: ReleaseDetailBean[] = [];
  roles: Role[] = [];

  unplannedEpics: EpicBean[] = [];
  editEpic: EpicBean = new EpicBean();

  editEpicEstimates: EpicEstimateBean[] = [];


  companyId:number;
  productId:number;

  epicService: EpicService = inject(EpicService);
  priorityService = inject(PriorityService)
  subComponentService = inject(SubComponentService)
  roleService = inject(RoleService)
  planningService = inject(PlanningDashboardService)

  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog) {
    this.companyId = this.util.getCompanyId();
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadUnplannedReleases();
    this.loadMetadata();
  }


  loadMetadata(): void {
    this.priorityService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.priorities = data._embedded.priorities;
        this.priorities.sort((a, b) => a.priorityLevel - b.priorityLevel);
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




  loadUnplannedReleases(): void {
    this.planningService.getUnplannedReleasesByProductId(this.productId).subscribe({
      next: (data) => {
        console.log(data);
        this.releases = data;
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

  planEpic(id: number) {
    if (window.confirm("Are you sure you want to plan it?")) {
      this.planningService.planEpic(id).subscribe({
        next: (data) => {
          if (data.releaseToAddIn) {
            this.util.showSuccessMessage(`It is planned in release ${data.releaseToAddIn.name} starting from ${data.releaseToAddIn.startDate}.`);
            this.unplannedEpics = this.unplannedEpics.filter(wh => wh.id !== id);
          }
        },
        error: (err) => {
          console.info('---------------------');
          console.error(err);
          this.util.showErrorMessage(err);},
      });
    }
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


  showAssignments(assignments: EpicAssignmentBean[]): string {
    if (assignments && assignments.length > 0) {
      return assignments.map(estimate => `${estimate.resourceName}: ${estimate.hours} hrs`).join('<br/>');
    } else {
      return 'Missing';
    }
  }

  openDialogForNewEpic():void {
    let epic = new EpicBean();
    epic.productId = this.productId;
    epic.releaseId = null;
    this.openDialogForEpic(epic);
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
  protected readonly WorkingHourEnum = WorkingHourEnum;
  protected readonly EpicBean = EpicBean;
}
