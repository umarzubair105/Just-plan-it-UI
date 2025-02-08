import {Component, inject, OnInit} from '@angular/core';
import {CompanyService, Company, AddCompany, CommonResp, BaseModel} from '../services/company.service';
import { SectionComponent } from './section/section.component';
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
import { ShowErrorsDirective } from '../show-errors.directive';
import {WizardService} from '../services/wizard/wizard.service';
import {Router} from '@angular/router';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SectionComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule,
    MatListItem, MatList, MatIcon,ReactiveFormsModule, ShowErrorsDirective
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './company.component.html',
  //styleUrls: ['./company.component.css'],
  //providers:[CompanyService],

})
export class CompanyComponent implements OnInit {
  companies: Company[] = [];
  countries: BaseModel[] = [];
  totalCompanies : number = 0;
  selectedCompany: Company | null = null;
  errorMessage: string = '';
  addCompanySetup: AddCompany = { countryId:1, sampleCompanyId:1,name:'',email:'',resourceName:'',designation:'' };

  newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  step1Data: any = {};

  myForm: FormGroup;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private router: Router) {
    console.log('Construct')
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      resourceName: new FormControl('', Validators.required),
      email: ['', [Validators.required, Validators.email]],
      sampleCompanyId: [1],
      countryId: [2, Validators.required],
//      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // 10-digit number
    });
  }
  ngOnInit(): void {
    console.log('Testing')
    this.loadCountries()
    //this.loadCompanies();
  }

 // goToNextStep() {
//    this.router.navigate(['/resource']);
 // }
  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
      this.addCompanySetup = this.myForm.value;
      this.addNewCompanySetup();
    } else {
      console.error('Form is invalid');
    }
  }


  addNewCompanySetup(): void {
    this.companyService.addCompany(this.addCompanySetup).subscribe({
      next: (data) => {
        // action: string = 'Close'
        //this.wizardService.setStepData('company', this.step1Data);

        this.snackBar.open(data.message, 'Close', {
          duration: 3000, // 3 seconds
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.router.navigate(['/upload-resource', data.id]);
        //this.newCompany = { id: 0, name: '', sample: false };
      },
      error: (err) => {this.errorMessage = err; this.snackBar.open(err, 'Close', {
        duration: 3000, // 3 seconds
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });},
    });
  }

  loadCountries(): void {
    this.companyService.getAllCountries().subscribe({
      next: (data) => {
        console.log(data);
        this.countries = data._embedded.countries;
      },
      error: (err) => (this.errorMessage = err),
    });
  }

  // Load all companies
  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => {
        console.log(data);
        this.companies = data._embedded.companies;
        this.totalCompanies = data.page.totalElements;
        },
      error: (err) => (this.errorMessage = err),
    });
  }

  // Select a company to view details
  selectCompany(company: Company): void {
    this.selectedCompany = company;
  }

  // Create a new company
  addCompany(): void {
    this.companyService.createCompany(this.newCompany).subscribe({
      next: (data) => {
        this.companies.push(data);
        this.newCompany = { id: 0, name: '', sample: false };
      },
      error: (err) => (this.errorMessage = err),
    });
  }
  //!. ?.
//const companyToUpdate = this.selectedCompany ?? { id: 0, name: '', isSample: false };
  // Update a company
  updateCompany(company: Company | null): void {
    if (company) {
    this.companyService.updateCompany(company.id, company).subscribe({
      next: () => {
        this.loadCompanies();
        this.selectedCompany = null;
      },
      error: (err) => (this.errorMessage = err),
    });
    } else {
      console.error('Cannot update. Company is null.');
    }
  }

  // Delete a company
  deleteCompany(companyId: number): void {
    this.companyService.deleteCompany(companyId).subscribe({
      next: () => (this.companies = this.companies.filter((c) => c.id !== companyId)),
      error: (err) => (this.errorMessage = err),
    });
  }

  onEventEmit(e: any){
    alert('Hello in Company');
    alert(e);
  }
}
