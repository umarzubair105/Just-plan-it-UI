import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {AuthService} from '../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Company} from '../services/company.service';
@Injectable({
  providedIn: 'root' // ✅ Available throughout the app
})
export class Utils {
  constructor(private snackBar: MatSnackBar, private authService: AuthService,
              private router: Router) { }


  navigateToResource(rout: string) {
    this.router.navigate([rout]);
  }
  saveToken(token: string) {
    this.authService.login(token);
  }
  getCompanyId():number{
    return this.authService.getCompanyId();
  }
  setProductId(productId: number) {
    localStorage.setItem('productId', productId.toString());
  }
  getProductId(): number {
    return Number(localStorage.getItem('productId'));
  }
  showSuccessMessage(message: string) {
    this.showMessage(message,'Close');
  }
  showErrorMessage(message: string) {
    this.showMessage(message,'Close');
  }

  showMessage(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000, // 3 seconds
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

}
