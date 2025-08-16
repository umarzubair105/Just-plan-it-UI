import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatOption, MatSelect} from '@angular/material/select';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {TopBarComponent} from './components/top-bar.component';
import {SidebarComponent} from './components/sidebar.component';
import {isLoggedIn} from './utils/helper';
import {CommonModule} from '@angular/common';
import {AppConstants} from './configuration/app.constants';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    MatToolbarModule, MatFormField, MatRadioButton, MatRadioGroup,
    MatCheckbox, FormsModule, MatIcon, MatSelect, MatOption, MatCard,
    MatCardHeader, MatCardActions, MatProgressSpinner, MatAccordion,
    MatExpansionPanel, MatExpansionPanelTitle, MatCardContent, MatCardSubtitle,
    MatCardTitle, MatLabel, MatExpansionPanelHeader,
    TopBarComponent, SidebarComponent, CommonModule, MatSidenavContainer, MatSidenavContent, MatSidenav, RouterLink],//
//  template: `<app-company></app-company>`,
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-plan';
  isLoggedIn = false;//isLoggedIn();
  isSidenavOpen: boolean = false;
  constructor() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    // Simulating login check from local storage or auth service
    this.isLoggedIn =    localStorage.getItem(AppConstants.TOKEN_KEY) ? true : false;
    this.isSidenavOpen = this.isLoggedIn; // Open sidenav only if logged in
  }
  toggleSidebar() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  onEventEmit(e: any){
    alert('Hello in AppCompany');
    alert(e);
  }


}
