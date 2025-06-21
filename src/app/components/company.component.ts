import {Component, inject, OnInit} from '@angular/core';
import {CompanyService, AddCompany, CommonResp, BaseModel} from '../services/company.service';
import { SubComponentComponent } from './section/sub-component.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatList, MatListItem} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import { ShowErrorsDirective } from '../directives/show-errors.directive';
import {WizardService} from '../services/wizard/wizard.service';
import {Router} from '@angular/router';
import {Utils} from '../utils/utils';
import {Company} from '../models/basic';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule,
    MatListItem, MatList, MatIcon,ReactiveFormsModule, ShowErrorsDirective,
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './company.component.html',
  styleUrls: ['./common.css'],
  //providers:[CompanyService],

})
export class CompanyComponent implements OnInit {
  sampleCompanies: Company[] = [];
  countries: BaseModel[] = [];
  errorMessage: string = '';
  addCompany: AddCompany = new AddCompany();

  //newCompany: Company = new Company();
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  step1Data: any = {};

  //myForm: FormGroup;
  constructor(private fb: FormBuilder,
              private util: Utils,
              private router: Router) {
    console.log('Construct')
/*    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      resourceName: new FormControl('', Validators.required),
      designation: new FormControl('', Validators.required),
      mobileNumber: new FormControl('', Validators.required),
      email: ['', [Validators.required, Validators.email]],
      sampleCompanyId: [0, Validators.required],
      countryId: [0, Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
//      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // 10-digit number
    });*/
  }
  ngOnInit(): void {
    console.log('Testing')
    this.loadMetadata()
  }

 // goToNextStep() {
//    this.router.navigate(['/resource']);
 // }
  onSubmit() {
      //if (this.addCompany.password !== this.addCompany.confirmPassword) {
        //this.errorMessage = "Password is not matching with Confirm Password";
      //} else {
        this.errorMessage = '';
        this.addNewCompanySetup();
      //}
  }


  addNewCompanySetup(): void {
    this.companyService.addCompany(this.addCompany).subscribe({
      next: (data) => {
        // action: string = 'Close'
        //this.wizardService.setStepData('company', this.step1Data);
        this.util.showSuccessMessage('Company is added successfully.');
        this.companyService.login({username: this.addCompany.email,
          password: data.context,
          companyCode: ''}).pipe()
          .subscribe((resp: any) => {
              this.util.saveToken(resp.token);
              this.router.navigate(['/upload-resource']);
            },
            (error) => {
              this.errorMessage = error;
            });
      },
      error: (err) => (this.errorMessage = err)
    });
  }

  loadMetadata(): void {
    this.companyService.getMetadata().subscribe({
      next: (data) => {
        console.log(data);
        this.countries = data.countries;
        this.sampleCompanies = data.sampleCompanies;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

}
