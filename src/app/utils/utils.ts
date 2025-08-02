import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {AuthService} from '../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthResponse} from '../models/basic';
import {LabelService} from './labels';
import {messageChange} from './helper';
import {DeviceDetectorService} from 'ngx-device-detector';
@Injectable({
  providedIn: 'root' // ✅ Available throughout the app
})
export class Utils {
  constructor(private snackBar: MatSnackBar, private authService: AuthService,
              //private labelService: LabelService,
              private router: Router,
              private deviceService: DeviceDetectorService) { }


  navigateToResource(rout: string) {
    this.router.navigate([rout]);
  }
  saveToken(resp: AuthResponse) {
    this.authService.login(resp);
  }
  getCompanyId():number{
    return this.authService.getCompanyId();
  }
  getCompanyType():string|null{
    return this.authService.getCompanyType();
  }
  getSelectedProductId():number{
    return this.authService.getSelectedProductId();
  }
  setSelectedProductId(productId: number){
    return this.authService.setSelectedProductId(productId);
  }
  getLoggedResourceId():number{
    return this.authService.getUserId();
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
    this.snackBar.open(messageChange(message), action, {
      duration: 3000, // 3 seconds
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  isMobile(): boolean {
    return this.deviceService.isMobile();
  }
  isDesktop(): boolean {
    return this.deviceService.isDesktop();
  }

  /*label(key: string):string | undefined {
    return this.labelService.get(key);
  }*/
}
