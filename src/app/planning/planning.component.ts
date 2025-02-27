import {ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Utils} from '../utils/utils';
import {ActivatedRoute} from '@angular/router';
import {Epic, EpicBean, EpicEstimateBean, Release} from '../models/planning';
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
@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
    NgxDatatableModule, EpicEstimateComponent], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.css',
  providers: [BsModalService]
})
export class PlanningComponent implements OnInit {
  modalRef?: BsModalRef;

  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  releases: Release[] = [];
  roles: Role[] = [];

  unplannedEpics: EpicBean[] = [];
  editEpic: EpicBean = new EpicBean();

  editEpicEstimates: EpicEstimateBean[] = [];


  companyId:number;
  productId:number;

  epicService: EpicService = inject(EpicService);
  epicEstimateService: EpicEstimateService = inject(EpicEstimateService);
  priorityService = inject(PriorityService)
  subComponentService = inject(SubComponentService)
  roleService = inject(RoleService)

  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog) {
    this.companyId = this.util.getCompanyId();
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadUnplannedEpics();
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




  loadUnplannedEpics(): void {
    this.epicService.getUnplannedEpicBeansByProductId(this.companyId, this.productId).subscribe({
      next: (data) => {
        console.log(data);
        this.unplannedEpics = data;
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
          this.editEpic.priorityLeve = priority.priorityLevel;
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
          this.editEpic.priorityLeve = priority.priorityLevel;
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



  updateEpicEstimateModal(template: TemplateRef<any>, id: number) {
    if (id) {
      this.editEpic = this.unplannedEpics.find((x) => x.id === id)
        ?? new EpicBean();
      this.editEpicEstimates = this.editEpic.epicEstimates ?? [];
      this.modalRef = this.modalService.show(template);
    }
  }

  addEpicEstimate(): void {
    this.editEpicEstimates.push(new EpicEstimateBean());
  }
  deleteEpicEstimate(index: number): void {
    //this.editEpicEstimates.;
  }

  openDialog(row: EpicBean): void {
    const dialogRef = this.dialog.open(EpicEstimateComponent, {
      width: '80%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      data: { epicBean: row, roles: this.roles },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Handle the result here
    });
  }
  protected readonly WorkingHourEnum = WorkingHourEnum;
}
