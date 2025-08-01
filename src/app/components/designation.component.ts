import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {FormatDatePipe} from '../pipes/format.date';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {Designation, Role, RoleCode} from '../models/basic';
import {DesignationService} from '../services/designation.service';
import {Utils} from '../utils/utils';
import {RoleService} from '../services/role.service';
import {isGlobalHR} from '../utils/helper';
import {NgSelectComponent, NgSelectModule} from "@ng-select/ng-select";

@Component({
  selector: 'app-designation',
  standalone: true,
    imports: [NgSelectModule,FormsModule, CommonModule, ModalModule, HttpClientModule, FormatDatePipe, ShowErrorsDirective, NgSelectComponent], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './designation.component.html',
  providers: [BsModalService]
})
export class DesignationComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId:number = 0;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from SubComponent');
  }*/
  modalRef?: BsModalRef;
  @ViewChild('modelC') myModal!: TemplateRef<any>;
  models: Designation[] = [];
  roles: Role[] = [];
  errorMessage: string = '';
  model: Designation = new Designation();
  service = inject(DesignationService)
  roleService = inject(RoleService)
  //constructor(private companyService: CompanyService) {}
  constructor(private modalService: BsModalService,
              private utils: Utils,
              private router: Router,private route: ActivatedRoute) {}
  ngOnInit(): void {
    console.log('Testing')
    this.companyId = this.utils.getCompanyId();
    this.loadModels();
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.roles = data._embedded.roles;
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }
  loadModels(): void {
    this.service.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.models = data._embedded.designations;
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }



  // Create a new company
  add(): void {
    this.model.active = true;
    this.model.companyId = this.companyId;

    this.service.create(this.model).subscribe({
      next: (data) => {
        this.models.push(data);
        this.model = new Designation();
        this.utils.showSuccessMessage('Designation is added.');
        this.closeModal();

      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }
  update(): void {
    if (this.model) {
      this.service.update(this.model.id, {name: this.model.name,
        roleId: this.model.roleId}).subscribe({
        next: () => {
          this.loadModels();
          this.model = new Designation();
          this.utils.showSuccessMessage('Designation is updated.');
          this.closeModal();
        },
        error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
      });
    } else {
      console.error('Cannot update. Component is null.');
    }
  }
  delete(id: number): void {
    if (window.confirm("Are you sure you want to delete?")) {
      this.service.delete(id).subscribe({
        next: () => (this.models = this.models.filter((c) => c.id !== id)),
        error: (err) => {
          this.errorMessage = err;
          this.utils.showErrorMessage(err);
        },
      });
    }
  }
  addNewRole = (newName: string) => {
    if (!newName) {
      return;
    }
    let role:Role = new Role();
    role.name = newName;
    role.companyId = this.companyId;
    role.active = true;
    role.systemRole = false;
    role.code = RoleCode.TR;
    role.required = false;
    //const newPriority = { id: newId, name: newPriorityName };
    this.roleService.create(role).subscribe({
      next: (data) => {
        this.utils.showSuccessMessage('New role is added.')

        this.roles = [...this.roles, data];
        this.model.roleId = data.id;
        return data;
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
  };
  openModal(template: TemplateRef<any>) {
    this.model = new Designation();
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.model = this.models.find((x) => x.id === id)
        ?? new Designation();
      this.modalRef = this.modalService.show(template);
    }
  }
  closeModal() {
    this.modalRef?.hide();
  }


  protected readonly isGlobalHR = isGlobalHR;
}
