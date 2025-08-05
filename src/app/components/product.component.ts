import {Component, inject, OnInit} from '@angular/core';
import {AddProduct, BaseModel, CompanyService} from '../services/company.service';
import {SubComponentComponent} from './section/sub-component.component';
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
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../utils/utils';
import {getToDayDate, messageChange, ReleaseIteration} from '../utils/helper';
import {AuthService} from '../services/auth.service';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
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
  addProduct: AddProduct = new AddProduct();

  constructor(private utils: Utils,
              private router: Router, private route: ActivatedRoute,
              private authService: AuthService,) {

  }
  ngOnInit(): void {
    this.companyId =  this.utils.getCompanyId();
    //Number(this.route.snapshot.paramMap.get("companyId"));
    console.log('Testing:'+this.companyId)
  }

  onSubmit() {
      this.addProduct.code = this.addProduct.code.toUpperCase();
      this.addProduct.companyId = this.companyId; // Hardcoding companyId for now.
      this.companyService.addProduct(this.addProduct).subscribe({
        next: (data) => {
          // action: string = 'Close'
          this.utils.showSuccessMessage(data.message);
          this.productId = data.id;
          this.utils.setSelectedProductId(this.productId);
          sessionStorage.setItem('wizard', 'productSetup');
          this.authService.reloadTopBar();

          this.router.navigate(['/upload-epic']);
          //this.router.navigate(['/upload-epic', this.productId]);
        },
        error: (err) => {this.errorMessage = err; this.utils.showErrorMessage(err);},
      });
  }

  protected readonly messageChange = messageChange;
  protected readonly getToDayDate = getToDayDate;
}
