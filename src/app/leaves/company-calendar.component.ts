import {Component, inject, OnInit, TemplateRef} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {CompanyWeekend, CompanyWorkingHour, LeaveService, WorkingHourEnum} from './leave.service';
import {Utils} from '../utils/utils';
import {forkJoin, of, tap} from 'rxjs';
import {ReleaseIteration} from '../utils/helper';


@Component({
  selector: 'app-company-calendar',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule, ReactiveFormsModule], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './company-calendar.component.html',
  styleUrl: './company-calendar.component.css',
  providers: [BsModalService]
})
export class CompanyCalendarComponent  implements OnInit {
  modalRef?: BsModalRef;

  weekends: CompanyWeekend[] = [];
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  editWeekend: boolean =false;

  workingHourScopes = Object.keys(WorkingHourEnum)
    .filter(key => isNaN(Number(key)) && key!==WorkingHourEnum.DEFAULT) // Exclude numeric keys
    .map((key) => ({
      value: WorkingHourEnum[key as keyof typeof WorkingHourEnum], // Properly typed access
      viewValue: key,
    }));
  companyWorkingHours: CompanyWorkingHour[] = [];
  selectedCompanyWorkingHour?: CompanyWorkingHour;
  newCompanyWorkingHourTemp:CompanyWorkingHour = {
    id: 0,
    description: '',
    scope: WorkingHourEnum.DATE_RANGE,
    minutes: 0,
    active: true,
    companyId: 0,
    dayOfWeek: null,
    eventDate: null,
    startDate: null,
    endDate: null,
    recurring: false
  };
  newCompanyWorkingHour:CompanyWorkingHour;

  companyId:number;
  leaveService: LeaveService = inject(LeaveService);
  constructor(private modalService: BsModalService, private util: Utils) {
    this.companyId = this.util.getCompanyId();
    console.log('comid:'+this.companyId);
    this.newCompanyWorkingHour = this.newCompanyWorkingHourTemp;
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadWeekends();
    this.loadCompanyWorkingHours();
  }

  loadWeekends(): void {
    this.editWeekend = false;
    this.weekends= [];
    this.leaveService.getWeekendByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        var companyWeekends:CompanyWeekend[] = data._embedded.companyWeekends;
        this.weekDays.forEach(wd=> {
          if (companyWeekends.filter((cw)=>
            cw.day.toLowerCase() === wd.toLowerCase()).length>0) {
            this.weekends.push(<CompanyWeekend>companyWeekends.find((cw) =>
              cw.day.toLowerCase() === wd.toLowerCase()));
          } else {
            this.weekends.push({id:-1*this.weekends.length,day:wd.toUpperCase(),active:false,companyId:this.companyId});
          }
        });
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  saveWeekend() {
    // Collect all API call observables
    const apiCalls = this.weekends.map(wd => this.getUpdateObservable(wd));

    // Wait for all API calls to complete
    forkJoin(apiCalls).subscribe({
      next: (results) => {
        console.log('✅ All updates completed', results);
        this.util.showSuccessMessage('All weekends updated successfully!');
        this.loadWeekends(); // Refresh the weekends list
      },
      error: (err) => {
        console.error('❌ Error in updating weekends', err);
        this.util.showErrorMessage('Failed to update all weekends.');
        this.loadWeekends(); // Refresh the weekends list
      }
    });
  }
  // Helper method to return the correct API observable
  getUpdateObservable(wd: CompanyWeekend) {
    if (wd.id > 0 && wd.active === false) {
      return this.leaveService.deleteCW(wd.id).pipe(
        tap(() => this.util.showSuccessMessage(`${wd.day} is no longer a weekend`))
      );
    } else if (wd.id < 0 && wd.active === true) {
      return this.leaveService.createCW(wd).pipe(
        tap(() => this.util.showSuccessMessage(`${wd.day} is added as a weekend`))
      );
    }
    return of(null); // If no API call needed, return an observable of null
  }


  loadCompanyWorkingHours(): void {
    this.leaveService.getWorkingHoursByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.companyWorkingHours = data._embedded.companyWorkingHours;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  // Helper method to return the correct API observable
  updateCompanyWorkingHour(wd: CompanyWorkingHour) {
      return this.leaveService.updateWorkingHour(wd.id, wd).subscribe({
        next: (data) => {
          this.companyWorkingHours = this.companyWorkingHours.filter(wh => wh.id !== wd.id);
          //this.companyWorkingHours.push({ ...data });
          this.companyWorkingHours.unshift(data);
          this.newCompanyWorkingHour = this.newCompanyWorkingHourTemp;
          this.util.showSuccessMessage('Data is updated');
          this.closeModal();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }
  deleteCompanyWorkingHour(id: number) {
    return this.leaveService.deleteWorkingHour(id).subscribe({
      next: (data) => {
        this.util.showSuccessMessage('Data is deleted');
        this.companyWorkingHours = this.companyWorkingHours.filter(wh => wh.id !== id);
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  addCompanyWorkingHour() {
      this.newCompanyWorkingHour.active=true;
      this.newCompanyWorkingHour.recurring=true;
      this.newCompanyWorkingHour.companyId = this.companyId;
      return this.leaveService.createWorkingHour(this.newCompanyWorkingHour).subscribe({
        next: (data) => {
          this.companyWorkingHours.unshift(data);
          //this.companyWorkingHours.push({ ...data });
          this.newCompanyWorkingHour = this.newCompanyWorkingHourTemp;
          this.util.showSuccessMessage('Data is inserted.');
          this.loadCompanyWorkingHours();
          this.closeModal();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }

  isDisplay(field: string, scope: WorkingHourEnum) {
    if (scope === WorkingHourEnum.SPECIFIC_DATE) {
      return field === 'eventDate';
    } else if (scope === WorkingHourEnum.DATE_RANGE) {
      return field === 'startDate' || field === 'endDate';
    } else if (scope === WorkingHourEnum.WEEK_DAY) {
      return field === 'dayOfWeek';
    }
    return false;
  }
  // Open modal
  openModal(template: TemplateRef<any>) {
    this.newCompanyWorkingHour = this.newCompanyWorkingHourTemp;
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(viewLeaveTemplate: TemplateRef<any>, id: number) {
    console.log('openModalEdit:'+id);
    if (id) {
      this.selectedCompanyWorkingHour = this.companyWorkingHours.find((x) => x.id === id);
      this.newCompanyWorkingHour.id = this.selectedCompanyWorkingHour?.id ?? 0
      this.newCompanyWorkingHour.description = this.selectedCompanyWorkingHour?.description ?? '';
      this.newCompanyWorkingHour.scope = this.selectedCompanyWorkingHour?.scope ?? WorkingHourEnum.SPECIFIC_DATE;
      this.newCompanyWorkingHour.minutes = this.selectedCompanyWorkingHour?.minutes ?? 0;
      this.newCompanyWorkingHour.eventDate = this.selectedCompanyWorkingHour?.eventDate ?? null;
      this.newCompanyWorkingHour.startDate = this.selectedCompanyWorkingHour?.startDate ?? null;
      this.newCompanyWorkingHour.endDate = this.selectedCompanyWorkingHour?.endDate ?? null;
      this.newCompanyWorkingHour.dayOfWeek = this.selectedCompanyWorkingHour?.dayOfWeek ?? '';
      this.newCompanyWorkingHour.recurring = this.selectedCompanyWorkingHour?.recurring ?? false;
      this.newCompanyWorkingHour.companyId = this.selectedCompanyWorkingHour?.companyId ?? this.companyId;
      this.newCompanyWorkingHour.active = this.selectedCompanyWorkingHour?.active ?? true;
      this.modalRef = this.modalService.show(viewLeaveTemplate);
    }
  }
  // Close modal
  closeModal() {
    this.modalRef?.hide();
  }


  protected readonly WorkingHourEnum = WorkingHourEnum;
}
