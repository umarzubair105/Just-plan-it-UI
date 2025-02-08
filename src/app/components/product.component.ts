import {Component, inject, OnInit} from '@angular/core';
import {
  CompanyService,
  Company,
  AddCompany,
  CommonResp,
  BaseModel,
  AddResource,
  AddProduct
} from '../services/company.service';
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
import {ActivatedRoute, Router} from '@angular/router';

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
  providers:[CompanyService],

})
export class ProductComponent implements OnInit {
  roles: BaseModel[] = [];
  errorMessage: string = '';
  companyId!: number;
  productId? : number;
  //addCompanySetup: AddCompany = { countryId:1, sampleCompanyId:1,name:'',email:'',firstName:'',secondName:'',lastName:'',designation:'' };

  //newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  addProductSetup: AddProduct = { companyId:0, name:'',
    emailProductManager:'',emailProductOwner:'' };


  myForm: FormGroup;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private route: ActivatedRoute,private router: Router) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required]],
      emailProductManager: ['', [Validators.required, Validators.email]],
      emailProductOwner: ['', [Validators.required, Validators.email]],
//      countryId: [2, Validators.required],
//      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // 10-digit number
    });
  }
  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('companyId'));
    console.log('Testing')
    //this.loadRules()
    //this.loadCompanies();
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
      this.addProductSetup = this.myForm.value;
      this.addProductSetup.companyId = this.companyId; // Hardcoding companyId for now.
      this.companyService.addProduct(this.addProductSetup).subscribe({
        next: (data) => {
          // action: string = 'Close'
          this.snackBar.open(data.message, 'Close', {
            duration: 3000, // 3 seconds
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.productId = data.id;
          this.router.navigate(['/upload-epic', this.productId]);
        },
        error: (err) => {this.errorMessage = err; this.snackBar.open(err, 'Close', {
          duration: 3000, // 3 seconds
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });},
      });
    } else {
      console.error('Form is invalid');
    }
  }


}
