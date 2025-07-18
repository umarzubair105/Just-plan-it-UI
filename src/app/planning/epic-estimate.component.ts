import {Component, EventEmitter, inject, Inject, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';
import {EpicBean, EpicEstimate, EpicEstimateBean} from '../models/planning';
import {Priority, ResourceRightBean, Role, SubComponent} from '../models/basic';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {PositiveIntegerDirective} from '../directives/positive-integer.directive';
import {EpicEstimateService} from '../services/epic-estimate.service';
import {Utils} from '../utils/utils';
import {forkJoin, of, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {convertToMinutes, isManager, transformToDhM} from '../utils/helper';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'epic-estimate',
  standalone: true,
  imports: [CommonModule, FormsModule, ShowErrorsDirective],
  templateUrl: 'epic-estimate.component.html',
})
export class EpicEstimateComponent implements OnInit {
  epicBean!: EpicBean;
  roles!: Role[];
  epicEstimatBeans: EpicEstimateBean[] = [];
  epicEstimateService: EpicEstimateService = inject(EpicEstimateService);
  authService = inject(AuthService);
  rights  = new ResourceRightBean();
  constructor(public dialogRef: MatDialogRef<EpicEstimateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly util: Utils) {
    console.log('EpicEstimate');
    this.epicBean = data.epicBean;
    this.roles = data.roles;

    if (this.epicBean) {
      this.epicEstimatBeans = this.epicBean.estimates || [];
      this.roles.filter(r=>r.taskAssignable).forEach(r => {
        if (this.epicEstimatBeans.find(e=>e.roleId==r.id)===undefined) {
          let newB = new EpicEstimateBean();
          newB.roleName = r.name;
          console.log('EpicEstimate:'+newB.roleName);
          newB.roleId = r.id;
          newB.resources = 1;
          newB.estimate = 0;
          newB.estimateStr = '';
          newB.id=0;
          newB.active = true;
          newB.epicId = this.epicBean.id;
          this.epicEstimatBeans.push(newB);
        } else {
          console.log('EpicEstimate Found'+r.name)
        }
      });
      this.epicEstimatBeans.forEach(e=> {
        e.estimateStr = transformToDhM(e.estimate);
      });
      this.authService.getResourceRightsByProductId(this.epicBean.productId).subscribe({
        next: (data) => {
          this.rights = data;
          //this.epicEstimatBeans = this.epicEstimatBeans.filter(e=> isManager(this.rights) || e.roleId==this.rights.productRoleId);
        },
        error: (err) => {this.util.showErrorMessage(err);},
      });
    }
  }



  onSubmit(form: any): void {
    console.log('Form Submitted!', form.value);
    const serviceCalls = this.epicEstimatBeans.map((es) => {
      es.estimate = convertToMinutes(es.estimateStr);
      if (es.id === 0) {
        // Create new epic estimate
        return this.epicEstimateService.create(es).pipe(
          tap((data) => {
            es.id = data.id;
            console.log('adding id: ' + es.id)
          }),
          catchError((err) => {
            this.util.showErrorMessage(err);
            // Return an observable to keep forkJoin running
            return of(null);
          })
        );
      } else {
        // Update existing epic estimate
        return this.epicEstimateService.update(es.id, es).pipe(
          catchError((err) => {
            this.util.showErrorMessage(err);
            return of(null);
          })
        );
      }
    });
// Execute all service calls
    forkJoin(serviceCalls).subscribe((results) => {
      // Check if all service calls were successful
      const allSuccessful = results.every((result) => result !== null);
      if (allSuccessful) {
        this.util.showSuccessMessage('All data processed successfully.');
      } else {
        this.util.showErrorMessage('Some data could not be processed.');
      }
      this.closeDialog();
    });

  }
  ngOnInit() {
    console.log('Child component initialized');
  }
  closeDialog(): void {
    let result = {estimates:this.epicEstimatBeans};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  deleteEpicEstimate(id: number): void {
    if (window.confirm("Are you sure you want to delete?")) {
      this.epicEstimateService.delete(id).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Data is deleted');
//          this.epicEstimatBeans = this.epicEstimatBeans.filter(e=>e.id!==id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }
  removeEpicEstimate(indexToRemove: number): void {
    this.epicEstimatBeans[indexToRemove].estimateStr='';
  //  this.epicEstimatBeans.splice(indexToRemove, 1);
  }
  protected readonly isManager = isManager;
}
