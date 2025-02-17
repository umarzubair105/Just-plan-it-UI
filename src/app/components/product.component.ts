import {Component, inject, OnInit} from '@angular/core';
import {AddProduct, BaseModel, CompanyService} from '../services/company.service';
import {SectionComponent} from './section/section.component';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatList, MatListItem} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {ShowErrorsDirective} from '../show-errors.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../utils/utils';
import {ReleaseIteration} from '../utils/helper';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SectionComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule,
    MatListItem, MatList, MatIcon,ReactiveFormsModule, ShowErrorsDirective
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './product.component.html',
  //styleUrls: ['./company.component.css'],

})
export class ProductComponent implements OnInit {
  roles: BaseModel[] = [];
  errorMessage: string = '';
  companyId!: number;
  productId? : number;
  //addCompanySetup: AddCompany = { countryId:1, sampleCompanyId:1,name:'',email:'',firstName:'',secondName:'',lastName:'',designation:'' };

  releaseIterations = Object.keys(ReleaseIteration)
    .filter(key => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      value: ReleaseIteration[key as keyof typeof ReleaseIteration], // Properly typed access
      viewValue: key,
    }));

  //newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  addProductSetup: AddProduct = {startDate: null, endDate: null, otherActivitiesPercentTime:10,
     releaseIteration:ReleaseIteration.BI_WEEKLY, name:'', companyId:0, emailProductManager:'', emailProductOwner:''};

  myForm: FormGroup;
  constructor(private fb: FormBuilder, private utils: Utils,
              private router: Router, private route: ActivatedRoute) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required]],
      emailProductManager: ['', [Validators.required, Validators.email]],
      emailProductOwner: ['', [Validators.required, Validators.email]],
      otherActivitiesPercentTime: [10, [Validators.required,
        Validators.pattern('^\\d+$'),
        Validators.max(100), Validators.min(0)]],//,
      releaseIteration: [ReleaseIteration.BI_WEEKLY],
      startDate: ['', [Validators.required]],
      endDate: [''],

//      countryId: [2, Validators.required],
//      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // 10-digit number
    });
  }
  ngOnInit(): void {
    this.companyId =  this.utils.getCompanyId();
    //Number(this.route.snapshot.paramMap.get("companyId"));
    console.log('Testing:'+this.companyId)
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
      this.addProductSetup = this.myForm.value;
      this.addProductSetup.companyId = this.companyId; // Hardcoding companyId for now.
      this.companyService.addProduct(this.addProductSetup).subscribe({
        next: (data) => {
          // action: string = 'Close'
          this.utils.showSuccessMessage(data.message);
          this.productId = data.id;
          this.router.navigate(['/upload-epic', this.productId]);
        },
        error: (err) => {this.errorMessage = err; this.utils.showErrorMessage(err);},
      });
    } else {
      console.error('Form is invalid');
    }
  }


}
