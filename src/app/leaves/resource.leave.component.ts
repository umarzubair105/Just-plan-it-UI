import {Component, inject, Inject, OnInit, TemplateRef} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {LeaveStatus, LeaveType, Resource, ResourceLeave} from '../models/basic';
import {ResourceLeaveService} from '../services/resource.leave.service';
import {Utils} from '../utils/utils';
import {ActivatedRoute, Router} from '@angular/router';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ResourceService} from '../services/resource.service';
import {FormatDatePipe} from '../pipes/format.date';


@Component({
  selector: 'app-resource-leave',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent, ShowErrorsDirective, FormatDatePipe], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './resource.leave.component.html',
  providers: [BsModalService]
})
export class ResourceLeaveComponent  implements OnInit {
  modalRef?: BsModalRef;
  leaves: ResourceLeave[] = [];
  leave: ResourceLeave = new ResourceLeave();
  companyId: number;
  resourceId: number;
  loggedUserId: number = 0;
  resource: Resource = new Resource();
  resourceService = inject(ResourceService);
  leaveTypes = Object.keys(LeaveType)
    .filter(key => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      value: key, // Properly typed access
      viewValue: key,
    }));


  leaveStatuses = Object.keys(LeaveStatus)
    .filter(key => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      value: key, // Properly typed access
      viewValue: key,
    }));
  constructor(private modalService: BsModalService,
              private resourceLeaveService: ResourceLeaveService,private util: Utils,
              private router: Router,private route: ActivatedRoute,

              public dialogRef: MatDialogRef<ResourceLeaveComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
) {
    this.companyId = this.util.getCompanyId();
    if (data && data.resource) {
      this.resourceId = data.resource.id;
      this.resource = data.resource;
    } else {
      this.resourceId = Number(this.route.snapshot.paramMap.get('resourceId'));
      if (!this.resourceId || this.resourceId == 0) {
        this.resourceId = util.getLoggedResourceId();
      }
      this.resourceService.getById(this.resourceId).subscribe({
        next: (data) => {
          this.resource = data;
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
    this.loggedUserId = util.getLoggedResourceId();
  }

  ngOnInit(): void {
    console.log('Testing');
    this.loadResourceLeaves();
  }
  loadResourceLeaves(): void {
    this.resourceLeaveService.getByResourceId(this.resourceId).subscribe({
      next: (data) => {
        console.log(data);
        this.leaves = data._embedded.resourceLeaves;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  // Helper method to return the correct API observable
  update() {
    this.resourceLeaveService.update(this.leave.id,
      this.leave).subscribe({
      next: (data) => {
        this.leave = new ResourceLeave();
        this.util.showSuccessMessage('Data is updated');
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  delete(id: number) {
    if (window.confirm("Are you sure you want to delete?")) {
      let model = this.leaves.find((x) => x.id === id);
      if (model) {
        model.active = false;
        this.resourceLeaveService.delete(model.id).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('Data is deleted');
            this.leaves = this.leaves.filter(wh => wh.id !== id);
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
      }
    }
  }

  updateStatus(id: number, status: LeaveStatus) {
    if (window.confirm("Are you sure you want to get it "+status+"?")) {
      const approvedAt = new Date();
      this.resourceLeaveService.updateSpecificFieldsPasses(id,
        {status:status, approvedAt:approvedAt,approvedBy:this.loggedUserId}).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('Status is updated.');
            const matched = this.leaves.find(wh => wh.id == id);
            if (matched) {
              matched.status = status;
              matched.approvedBy = this.loggedUserId;
              matched.approvedAt = approvedAt;
            }
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
    }
  }

  add() {
    this.leave.active=true;
    this.leave.resourceId=this.resourceId;
    this.leave.status = LeaveStatus.PENDING;
    return this.resourceLeaveService.create(this.leave).subscribe({
      next: (data) => {
        this.leaves = [...this.leaves, data];
        this.leave = new ResourceLeave();
        this.util.showSuccessMessage('Data is inserted.');
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  closeDialog(): void {
    let result = {};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  openModal(template: TemplateRef<any>) {
    this.leave = new ResourceLeave();
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.leave = this.leaves.find((x) => x.id === id)
        ?? new ResourceLeave();
      this.modalRef = this.modalService.show(template);
    }
  }
  closeModal() {
    this.modalRef?.hide();
  }

  protected readonly LeaveStatus = LeaveStatus;
}
