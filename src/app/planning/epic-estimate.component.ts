import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {EpicBean, EpicEstimate, EpicEstimateBean} from '../models/planning';
import {Role} from '../models/basic';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'epic-estimate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'epic-estimate.component.html',
})
export class EpicEstimateComponent implements OnInit {
  epicEstimate!: EpicEstimate;
  epicBean!: EpicBean;
  roles!: Role[];
  //@Output() formSubmit = new EventEmitter<EpicBean>();
  epicEstimatBeans: EpicEstimateBean[] = []
  constructor(public dialogRef: MatDialogRef<EpicEstimateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('EpicEstimate');
    this.epicBean = data.epicBean;
    this.roles = data.roles;
    if (this.epicBean) {
      this.epicEstimatBeans = this.epicBean.epicEstimates || [];
      if (this.epicEstimatBeans.length == 0) {
        this.roles.filter(r=>r.taskAssignable).forEach(r => {
          if (this.epicEstimatBeans.find(e=>e.roleId==r.id)===undefined) {
            let newB = new EpicEstimateBean();
            newB.roleName = r.name;
            console.log('EpicEstimate:'+newB.roleName);

            newB.roleId = r.id;
            newB.resources = 1;
            newB.hours = 5;
            this.epicEstimatBeans.push(newB);
          }
        });
      }
    }
  }

  ngOnInit() {
    console.log('Child component initialized');
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  deleteEpicEstimate(index: number): void {
    //this.editEpicEstimates.;
  }
}
