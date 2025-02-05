import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompanyComponent } from './components/company.component';
import {SectionComponent} from './components/section/section.component';
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
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CompanyComponent, SectionComponent,
    MatToolbarModule, MatFormField, MatRadioButton, MatRadioGroup,
    MatCheckbox, FormsModule, MatIcon, MatSelect, MatOption, MatCard,
    MatCardHeader, MatCardActions, MatProgressSpinner, MatAccordion,
    MatExpansionPanel, MatExpansionPanelTitle, MatCardContent, MatCardSubtitle,
  MatCardTitle, MatLabel, MatExpansionPanelHeader],//
//  template: `<app-company></app-company>`,
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-plan';

  onEventEmit(e: any){
    alert('Hello in AppCompany');
    alert(e);
  }
}
