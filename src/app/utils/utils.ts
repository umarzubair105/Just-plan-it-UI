import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {AuthService} from '../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
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
