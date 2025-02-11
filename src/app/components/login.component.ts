import {Component, inject, OnInit} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { Router } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CompanyService} from '../services/company.service';
import {AuthService} from '../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ShowErrorsDirective } from '../show-errors.directive';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, ReactiveFormsModule,
    ShowErrorsDirective,
    MatButtonModule, MatIcon, MatInputModule, MatFormFieldModule], // Include FormsModule here
  templateUrl:'login.component.html',
styleUrl:'common.css',
})
export class LoginComponent {
  errorMessage: string = '';
  myForm: FormGroup;
  companyService = inject(CompanyService)
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private router: Router,private http: HttpClient,
              private authService: AuthService) {
    this.myForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

  }

  onSubmit() {
    console.log('Form Data:', this.myForm.valid);
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
      this.companyService.login(this.myForm.value)
        .subscribe((resp: any) => {
          this.authService.login(resp.token);
          this.router.navigate(['/home']); // Redirect to a secure page
        },
        (error) => {
          console.log('Error:', error);
          this.errorMessage = error;
        });
    }
  }
}
