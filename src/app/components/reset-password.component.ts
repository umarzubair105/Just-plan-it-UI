import {Component, inject, OnInit} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CommonResp, CompanyService} from '../services/company.service';
import {AuthService} from '../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ShowErrorsDirective } from '../directives/show-errors.directive';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {Utils} from '../utils/utils';


@Component({
  selector: 'app-reset-password',
  standalone: true,
    imports: [FormsModule, CommonModule, HttpClientModule, ReactiveFormsModule,
        ShowErrorsDirective,
        MatButtonModule, MatIcon, MatInputModule, MatFormFieldModule, RouterOutlet, RouterLink], // Include FormsModule here
  templateUrl:'reset-password.component.html',
styleUrl:'common.css',
})
export class ResetPasswordComponent {
  errorMessage: string = '';
  myForm: FormGroup;
  companyService = inject(CompanyService)
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private router: Router,private http: HttpClient,
              private readonly util: Utils) {
    this.myForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]]
    });

  }

  onSubmit() {
    console.log('Form Data:', this.myForm.valid);
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
      this.companyService.resetPassword(this.myForm.value)
        .subscribe((resp: CommonResp) => {
            this.util.showSuccessMessage(resp.message);
            this.router.navigate(['/home']); // Redirect to a secure page
        },
        (error) => {
          console.log('Error:', error);
          this.errorMessage = error;
        });
    }
  }
}
