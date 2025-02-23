import {Component, inject, OnInit, TemplateRef} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Utils} from '../utils/utils';
import {ActivatedRoute} from '@angular/router';
import {Epic, EpicBean, Release} from '../models/planning';
import {EpicService} from '../services/epic.service';
import {Priority, SubComponent} from '../models/basic';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {PriorityService} from '../services/priority.service';
import {SubComponentService} from '../services/sub-component.service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule,
    NgxDatatableModule], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.css',
  providers: [BsModalService]
})
export class PlanningComponent implements OnInit {
  modalRef?: BsModalRef;

  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  releases: Release[] = [];

  unplannedEpics: EpicBean[] = [];
  editEpic: EpicBean = new EpicBean();
  unplannedTabColumn = [
    { prop: 'code', name: 'Code' },
    { prop: 'title', name: 'Title' },
    { prop: 'priorityId', name: 'Priority' },
    { prop: 'valueGain', name: 'Value Gain' },
    { prop: 'requiredBy', name: 'Required By' },
  ];
  companyId:number;
  productId:number;

  epicService: EpicService = inject(EpicService);
  priorityService = inject(PriorityService)
  subComponentService = inject(SubComponentService)

  constructor(private readonly modalService: BsModalService, private readonly util: Utils, private readonly route: ActivatedRoute) {
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
        console.log(data);
        this.priorities = data._embedded.priorities;
        this.priorities.sort((a, b) => a.priorityLevel - b.priorityLevel);
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
    this.subComponentService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.subComponents = data._embedded.components;
        this.subComponents.sort((a, b) => a.name.localeCompare(b.name));
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
      this.editEpic.productId = this.productId;
      return this.epicService.create(this.editEpic).subscribe({
        next: (data) => {
          //this.unplannedEpics.push(data);
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
}
