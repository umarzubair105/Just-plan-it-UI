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
import {ReleaseIteration} from '../utils/helper';
import {ContactUs} from '../models/basic';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SubComponentComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule,
    MatListItem, MatList, MatIcon,ReactiveFormsModule, ShowErrorsDirective
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './contactus.component.html',
  //styleUrls: ['./company.component.css'],

})
export class ContactUsComponent implements OnInit {
  roles: BaseModel[] = [];
  errorMessage: string = '';
  companyId!: number;

  //newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  model: ContactUs = new ContactUs();

  constructor(private utils: Utils,
              private router: Router, private route: ActivatedRoute) {

  }
  ngOnInit(): void {
    this.companyId =  this.utils.getCompanyId();
  }

  onSubmit() {
      this.model.active = true;
      this.model.companyId = this.companyId; // Hardcoding companyId for now.
      this.companyService.contactUs(this.model).subscribe({
        next: (data) => {
          // action: string = 'Close'
          this.utils.showSuccessMessage(data.message);
          this.model = new ContactUs();
          this.router.navigate(['/home']);
        },
        error: (err) => {this.errorMessage = err; this.utils.showErrorMessage(err);},
      });
  }

}
