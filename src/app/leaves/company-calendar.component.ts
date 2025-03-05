import {Component, inject, OnInit, TemplateRef} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common'; // ✅ Use CommonModule
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {
  CompanyCalendar,
  CompanyWeekend,
  CompanyWorkingHour,
  EventTypeEnum,
  LeaveService,
  WorkingHourEnum
} from '../services/leave.service';
import {Utils} from '../utils/utils';
import {forkJoin, of, tap} from 'rxjs';
import {ReleaseIteration} from '../utils/helper';
import {Router} from '@angular/router';


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
  editCompanyWorkingHour!: CompanyWorkingHour;

  eventTypes = Object.keys(EventTypeEnum)
    .filter(key => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      value: key, // Properly typed access
      viewValue: key,
    }));
  companyCalendars: CompanyCalendar[] = [];
  editCompanyCalendar!: CompanyCalendar;


  companyId:number;
  leaveService: LeaveService = inject(LeaveService);
  constructor(private modalService: BsModalService, private util: Utils,
              private router: Router,) {
    this.companyId = this.util.getCompanyId();
    console.log('comid:'+this.companyId);
    this.editCompanyWorkingHour = new CompanyWorkingHour();
  }
  ngOnInit(): void {
    console.log('Testing');
    this.loadWeekends();
    this.loadCompanyWorkingHours();
    this.loadCompanyCalendars();
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

  next(){
    this.router.navigate(['/product']);
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
  updateCompanyWorkingHour() {
      this.leaveService.updateWorkingHour(this.editCompanyWorkingHour.id,
        this.editCompanyWorkingHour).subscribe({
        next: (data) => {
          this.editCompanyWorkingHour = new CompanyWorkingHour();
          this.util.showSuccessMessage('Data is updated');
          this.closeModal();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }
  deleteCompanyWorkingHour(id: number) {
    if (window.confirm("Are you sure you want to delete?")) {
      var compCal = this.companyWorkingHours.find((x) => x.id === id);
      if (compCal) {
        compCal.active = false;
        this.leaveService.updateWorkingHour(compCal.id,
          compCal).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('Data is deleted');
            this.companyWorkingHours = this.companyWorkingHours.filter(wh => wh.id !== id);
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
      }
    }
  }

  addCompanyWorkingHour() {
      this.editCompanyWorkingHour.active=true;
      this.editCompanyWorkingHour.recurring=true;
      this.editCompanyWorkingHour.companyId = this.companyId;
      return this.leaveService.createWorkingHour(this.editCompanyWorkingHour).subscribe({
        next: (data) => {
          this.companyWorkingHours.unshift(data);
          this.editCompanyWorkingHour = new CompanyWorkingHour();
          this.util.showSuccessMessage('Data is inserted.');
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
  openWDModal(template: TemplateRef<any>) {
    this.editCompanyWorkingHour = new CompanyWorkingHour();
    this.modalRef = this.modalService.show(template);
  }
  openWDModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.editCompanyWorkingHour = this.companyWorkingHours.find((x) => x.id === id)
        ?? new CompanyWorkingHour();
      this.modalRef = this.modalService.show(template);
    }
  }
  // Close modal
  closeModal() {
    this.modalRef?.hide();
  }


  loadCompanyCalendars(): void {
    this.leaveService.getCompanyCalendarsByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.companyCalendars = data._embedded.companyCalendars;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  // Helper method to return the correct API observable
  updateCompanyCalendar() {
    this.leaveService.updateCompanyCalendar(this.editCompanyCalendar.id,
      this.editCompanyCalendar).subscribe({
      next: (data) => {
        this.editCompanyCalendar = new CompanyCalendar();
        this.util.showSuccessMessage('Data is updated');
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  deleteCompanyCalendar(id: number) {
    if (window.confirm("Are you sure you want to delete?")) {
      var compCal = this.companyCalendars.find((x) => x.id === id);
      if (compCal) {
        compCal.active = false;
        this.leaveService.updateCompanyCalendar(compCal.id,
          compCal).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('Data is deleted');
            this.companyCalendars = this.companyCalendars.filter(wh => wh.id !== id);
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
      }
    }
  }

  addCompanyCalendar() {
    this.editCompanyCalendar.active=true;
    this.editCompanyCalendar.recurring=true;
    this.editCompanyCalendar.companyId = this.companyId;
    return this.leaveService.createCompanyCalendar(this.editCompanyCalendar).subscribe({
      next: (data) => {
        this.companyCalendars.unshift(data);
        this.editCompanyCalendar = new CompanyCalendar();
        this.util.showSuccessMessage('Data is inserted.');
        this.closeModal();
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  // Open modal
  openCCModal(template: TemplateRef<any>) {
    this.editCompanyCalendar = new CompanyCalendar();
    this.modalRef = this.modalService.show(template);
  }
  openCCModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.editCompanyCalendar = this.companyCalendars.find((x) => x.id === id)
        ?? new CompanyCalendar();
      this.modalRef = this.modalService.show(template);
    }
  }


  protected readonly WorkingHourEnum = WorkingHourEnum;
}
