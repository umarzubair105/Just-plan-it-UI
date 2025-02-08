import {Component, inject, OnInit} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { Router } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CompanyService} from '../services/company.service';
import {AuthService} from '../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ShowErrorsDirective } from '../show-errors.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, ReactiveFormsModule,
    ShowErrorsDirective], // Include FormsModule here
  templateUrl:'login.component.html',

  providers: [CompanyService] // Include HttpClientModule here
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
          this.authService.saveToken(resp.token);
          this.router.navigate(['/company']); // Redirect to a secure page
        },
        (error) => {
          this.errorMessage = 'Invalid credentials. Please try again!';
        });
    }
  }
}
