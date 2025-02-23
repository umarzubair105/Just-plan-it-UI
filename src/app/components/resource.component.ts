import {Component, inject, Input, OnInit} from '@angular/core';
import {CompanyService, Company, AddCompany, CommonResp, BaseModel, AddResource} from '../services/company.service';
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
import { ShowErrorsDirective } from '../show-errors.directive';

import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../utils/utils';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-resource',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule,
    MatListItem, MatList, MatIcon,ReactiveFormsModule, ShowErrorsDirective
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './resource.component.html',
  //styleUrls: ['./company.component.css'],
  //providers:[CompanyService],

})
export class ResourceComponent implements OnInit {
  roles: BaseModel[] = [];
  errorMessage: string = '';
  companyId!: number;
  //addCompanySetup: AddCompany = { countryId:1, sampleCompanyId:1,name:'',email:'',firstName:'',secondName:'',lastName:'',designation:'' };

  //newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  addResourceSetup: AddResource = { companyId:0, email:'' };

  myForm: FormGroup;
  constructor(private fb: FormBuilder, private utils: Utils,
              private router: Router, private route: ActivatedRoute) {
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
    this.loadRules()
    //this.loadCompanies();
  }

  onSubmit() {
    if (this.myForm.valid && this.companyId!=null) {
      console.log('Form Data:', this.myForm.value);
      this.addResourceSetup = this.myForm.value;
      this.addResourceSetup.companyId = this.companyId; // Hardcoding companyId for now.
      this.companyService.addResource(this.addResourceSetup).subscribe({
        next: (data) => {
          // action: string = 'Close'
          this.utils.showSuccessMessage(data[0].message);
          this.router.navigate(['/product', this.companyId]);
          //this.newCompany = { id: 0, name: '', sample: false };
        },
        error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
      });
    } else {
      console.error('Form is invalid');
    }
  }


  loadRules(): void {
    this.companyService.getRoles(this.companyId).subscribe({
      next: (data) => {
        this.roles = data._embedded.roles;
      },
      error: (err) => (this.errorMessage = err),
    });
  }

}
