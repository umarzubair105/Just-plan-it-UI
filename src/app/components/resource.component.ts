import {Component, inject, Input, OnInit, TemplateRef} from '@angular/core';
import {CompanyService,  AddCompany, CommonResp, BaseModel, AddResource} from '../services/company.service';
import { SubComponentComponent } from './section/sub-component.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatList, MatListItem} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import { ShowErrorsDirective } from '../directives/show-errors.directive';

import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../utils/utils';
import {
  Designation,
  LeaveStatus,
  LeaveType,
  Resource,
  ResourceLeave,
  ResourceRightBean,
  ResourceStatus,
  Role, RoleCode
} from '../models/basic';
import {ResourceService} from '../services/resource.service';
import {RoleService} from '../services/role.service';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {EpicEstimateComponent} from '../planning/epic-estimate.component';
import {MatDialog} from '@angular/material/dialog';
import {ResourceLeaveComponent} from '../leaves/resource.leave.component';
import {DesignationService} from '../services/designation.service';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {ReleaseStatusEnum} from '../models/planning';
import {FormatDatePipe} from '../pipes/format.date';
import {AuthService} from '../services/auth.service';
import {isGlobalHR} from '../utils/helper';
import {NgSelectComponent, NgSelectModule} from '@ng-select/ng-select';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-resource',
  standalone: true,
  imports: [NgSelectModule, FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule, ModalModule,
    MatListItem, MatList, MatIcon, ReactiveFormsModule, ShowErrorsDirective, DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent, FormatDatePipe, NgSelectComponent
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './resource.component.html',
  //styleUrls: ['./company.component.css'],
  //providers:[CompanyService],
  providers: [BsModalService]
})
export class ResourceComponent implements OnInit {
  modalRef?: BsModalRef;
  roles: Role[] = [];
  designations: Designation[] = [];
  errorMessage: string = '';
  companyId!: number;
  //addCompanySetup: AddCompany = { countryId:1, sampleCompanyId:1,name:'',email:'',firstName:'',secondName:'',lastName:'',designation:'' };

  //newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService);
  resourceService = inject(ResourceService);
  roleService = inject(RoleService);
  designationService = inject(DesignationService);
  //constructor(private companyService: CompanyService) {}
  resources: Resource[] = [];
  allleads: Resource[] = [];
  leads: Resource[] = [];
  resource: Resource = new Resource();
  authService = inject(AuthService);
  rights  = new ResourceRightBean();

  myForm: FormGroup;
  statuses = Object.keys(ResourceStatus)
    .filter(key => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      value: key, // Properly typed access
      viewValue: key,
    }));
  constructor(private modalService: BsModalService,
              private readonly fb: FormBuilder, private readonly utils: Utils,
              private readonly router: Router, private readonly route: ActivatedRoute,
              public dialog: MatDialog) {
    console.log('Construct')
    this.myForm = this.fb.group({
      email: ['', [Validators.required]],
      roleId: [0, Validators.required],
//      countryId: [2, Validators.required],
//      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // 10-digit number
    });

  }
  ngOnInit(): void {
    this.companyId = this.utils.getCompanyId();
      //Number(this.route.snapshot.paramMap.get('companyId'));
    console.log(this.companyId); // Output: 123
    console.log('Testing')

    this.authService.getResourceRights().subscribe({
      next: (data) => {
        this.rights = data;
        this.loadResources();
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
    this.loadRoles();
    this.loadDesignations();
    //this.loadCompanies();
  }



  loadRoles(): void {
    this.roleService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.roles = data._embedded.roles;
      },
      error: (err) => (this.errorMessage = err),
    });
  }
  loadDesignations(): void {
    this.designationService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.designations = data._embedded.designations;
      },
      error: (err) => (this.errorMessage = err),
    });
  }

  loadResources(): void {
    this.resourceService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        var tempR : Resource[] = data._embedded.resources;
        this.allleads = tempR.filter(t=> t.lead);
        const loggedUserId = this.authService.getUserId();
        if (!isGlobalHR(this.rights)) {
          tempR = tempR.filter(t=> t.id==loggedUserId || t.leadResourceId==loggedUserId);
        }
        this.resources = tempR;
      },
      error: (err) => (this.errorMessage = err),
    });
  }
  openDialogForLeaves(resource: Resource): void {
    const dialogRef = this.dialog.open(ResourceLeaveComponent, {
      width: '80%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { resource: resource },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        //row.estimates = result.estimates;
      }
      // Handle the result here
    });
  }


  add() {
    this.resource.companyId=this.companyId;
    return this.companyService.addResource(this.resource).subscribe({
      next: (data) => {
        this.loadResources();
        this.utils.showSuccessMessage('Data is inserted. Email is sent to user for password.');
        this.closeModal();
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
  }
  update() {
    this.resourceService.updateSpecificFieldsPasses(this.resource.id,
      {name: this.resource.name,designationId: this.resource.designationId,
        dateOfBirth:this.resource.dateOfBirth,mobileNumber:this.resource.mobileNumber,
        roleId:this.resource.roleId,lead:this.resource.lead,
        email:this.resource.email,
        leadResourceId:this.resource.leadResourceId,
        lastWorkingDate:this.resource.lastWorkingDate,
        status: this.resource.status}
    ).subscribe({
      next: (data) => {
        this.loadResources();
        this.utils.showSuccessMessage('Data is updated');
        this.closeModal();
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
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
        this.resource.roleId = data.id;
        return data;
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
  };

  addNewDesignation = (newName: string) => {
    if (!newName) {
      return;
    }
    let d:Designation = new Designation();
    d.name = newName;
    d.companyId = this.companyId;
    d.active = true;
    d.roleId = null;
    //const newPriority = { id: newId, name: newPriorityName };
    this.designationService.create(d).subscribe({
      next: (data) => {
        this.utils.showSuccessMessage('New designation is added.')

        this.designations = [...this.designations, data];
        this.resource.designationId = data.id;
        return data;
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
  };
  openModal(template: TemplateRef<any>) {
    this.resource = new Resource();
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.leads =  this.allleads.filter(t=> t.id!=id);
      this.resource = this.resources.find((x) => x.id === id)
        ?? new Resource();
      this.modalRef = this.modalService.show(template);
    }
  }
  closeModal() {
    this.modalRef?.hide();
  }

  protected readonly isGlobalHR = isGlobalHR;
}
