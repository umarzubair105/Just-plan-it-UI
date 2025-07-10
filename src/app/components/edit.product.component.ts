import {Component, inject, Input, OnInit, TemplateRef} from '@angular/core';
import {CompanyService,  AddCompany, CommonResp, BaseModel, AddResource} from '../services/company.service';
import { SubComponentComponent } from './section/sub-component.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

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
import {LeaveStatus, LeaveType, Resource, ResourceLeave, ResourceStatus, Role} from '../models/basic';
import {ResourceService} from '../services/resource.service';
import {RoleService} from '../services/role.service';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {EpicEstimateComponent} from '../planning/epic-estimate.component';
import {MatDialog} from '@angular/material/dialog';
import {ResourceLeaveComponent} from '../leaves/resource.leave.component';
import {Designation, DesignationService} from '../services/designation.service';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {Product, ReleaseStatusEnum} from '../models/planning';
import {FormatDatePipe} from '../pipes/format.date';
import {ProductService} from '../services/product.service';
import {ReleaseIteration} from '../utils/helper';
import {DecimalToTimePipe} from "../pipes/decimal.to.time";

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-resource',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule, ModalModule,
    MatListItem, MatList, MatIcon, ReactiveFormsModule, ShowErrorsDirective, DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent, FormatDatePipe, DecimalToTimePipe
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './edit.product.component.html',
  //styleUrls: ['./company.component.css'],
  //providers:[CompanyService],
  providers: [BsModalService]
})
export class EditProductComponent implements OnInit {
  modalRef?: BsModalRef;
  errorMessage: string = '';
  companyId!: number;
  modelService = inject(ProductService);
  models: Product[] = [];
  model: Product = new Product();
  releaseIterations = Object.keys(ReleaseIteration)
    .filter(key => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      value: ReleaseIteration[key as keyof typeof ReleaseIteration], // Properly typed access
      viewValue: key,
    }));
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
    console.log('Construct');
  }
  ngOnInit(): void {
    this.companyId = this.utils.getCompanyId();
    console.log(this.companyId); // Output: 123
    console.log('Testing')
    this.loadModels();

  }

  addNewModel(): void {
    this.router.navigate(['/product']);
  }

  loadModels(): void {
    this.modelService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        this.models = data._embedded.products;
      },
      error: (err) => (this.errorMessage = err),
    });
  }

  update() {
    this.modelService.updateSpecificFieldsPasses(this.model.id,
      {name: this.model.name,startDate: this.model.startDate,
        endDate:this.model.endDate,otherActivitiesPercentTime:this.model.otherActivitiesPercentTime,
        releaseIteration: this.model.releaseIteration
      }
    ).subscribe({
      next: (data) => {
        this.loadModels();
        this.utils.showSuccessMessage('Data is updated');
        this.closeModal();
      },
      error: (err) => (this.utils.showErrorMessage(err)),
    });
  }
  openModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.model = this.models.find((x) => x.id === id)
        ?? new Product();
      this.modalRef = this.modalService.show(template);
    }
  }
  closeModal() {
    this.modalRef?.hide();
  }

}
