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
  Role
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

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule, ModalModule,
    MatListItem, MatList, MatIcon, ReactiveFormsModule, ShowErrorsDirective, DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent, FormatDatePipe
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './profile.component.html',
  //styleUrls: ['./company.component.css'],
  //providers:[CompanyService],
  providers: [BsModalService]
})
export class ProfileComponent implements OnInit {
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
              private readonly router: Router, private readonly route: ActivatedRoute) {
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

      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
    this.loadRoles();
    this.loadDesignations();
    this.resourceService.getById(this.authService.getUserId()).subscribe({
      next: (data) => {
        this.resource = data;
        if (this.resource.leadResourceId) {

          this.resourceService.getById(this.resource.leadResourceId).subscribe({
            next: (data) => {
              this.leads.push(data);

            },
            error: (err) => (this.errorMessage = err),
          });
        }
      },
      error: (err) => (this.errorMessage = err),
    });
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


  update() {
    this.resourceService.updateSpecificFieldsPasses(this.resource.id,
      {name: this.resource.name,
        dateOfBirth:this.resource.dateOfBirth,mobileNumber:this.resource.mobileNumber}
    ).subscribe({
      next: (data) => {
        this.utils.showSuccessMessage('Data is updated');
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
  }

  protected readonly isGlobalHR = isGlobalHR;
}
