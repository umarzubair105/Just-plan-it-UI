import {Component, EventEmitter, inject, Inject, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';
import {Epic, EpicBean, EpicEstimate, EpicEstimateBean} from '../models/planning';
import {Priority, Role, SubComponent} from '../models/basic';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {PositiveIntegerDirective} from '../directives/positive-integer.directive';
import {EpicEstimateService} from '../services/epic-estimate.service';
import {Utils} from '../utils/utils';
import {forkJoin, of, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {EpicService} from '../services/epic.service';

@Component({
  selector: 'epic',
  standalone: true,
  imports: [CommonModule, FormsModule, ShowErrorsDirective],
  templateUrl: 'epic.component.html',
})
export class EpicComponent implements OnInit {
  originalBean!: EpicBean;
  epicBean!: EpicBean;
  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  epicService: EpicService = inject(EpicService);

  constructor(public dialogRef: MatDialogRef<EpicComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly util: Utils) {
    console.log('EpicEstimate');
    this.originalBean = data.epicBean;
    this.epicBean = { ...this.originalBean };
    this.priorities = data.priorities;
    this.subComponents = data.subComponents;
    if (this.epicBean.id==0) {
      this.epicBean.active=true;
      this.epicBean.priorityId=null;
      this.epicBean.componentId=null;
      this.epicBean.forcefullyAdded=false;
      this.epicBean.code='EpicCode';
      this.epicBean.estimates = [];
    }
  }



  onSubmit(form: any): void {
    console.log('Form Submitted!', form.value);
    if (this.epicBean.id==0) {
      this.epicService.create(this.epicBean).subscribe({
        next: (data) => {
          this.epicBean.id = data.id;
          this.fillMetadata(data);
          this.util.showSuccessMessage('Data is inserted.');
          this.originalBean = this.epicBean;
          this.closeDialog();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    } else {
      this.epicService.update(this.epicBean.id,
        this.epicBean).subscribe({
        next: (data) => {
          this.fillMetadata(data);
          this.util.showSuccessMessage('Data is updated');
          this.originalBean = this.epicBean;
          this.closeDialog();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }

  }

  fillMetadata(data: Epic) {
    const priority = this.priorities.find(p => p.id === data.priorityId)
      ?? new Priority();
    this.epicBean.priorityName = priority.name;
    this.epicBean.priorityLevel = priority.priorityLevel;
    const subComp = this.subComponents.find(p => p.id === data.componentId)
      ?? new SubComponent();
    this.epicBean.componentName = subComp.name;
  }
  ngOnInit() {
    console.log('Child component initialized');
  }
  closeDialog(): void {
    let result = {epic:this.originalBean};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  closeDialogDoNothing(): void {
    let result = {};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  deleteEpicEstimate(id: number): void {
    if (window.confirm("Are you sure you want to delete?")) {
      this.epicService.delete(id).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Data is deleted');
//          this.epicEstimatBeans = this.epicEstimatBeans.filter(e=>e.id!==id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }

}
