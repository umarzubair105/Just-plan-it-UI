import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';

// Define the interface
export interface CompanyWeekend {
  id: number;
  day: string;
  active: boolean;
  companyId: number;
}

export enum WorkingHourEnum {
  DEFAULT="DEFAULT",
  DATE_RANGE = "DATE_RANGE",
  SPECIFIC_DATE = "SPECIFIC_DATE",
  WEEK_DAY = "WEEK_DAY",
}
export class CompanyWorkingHour {
  public id: number = 0;
  public description: string = '';
  public scope: WorkingHourEnum = WorkingHourEnum.SPECIFIC_DATE;
  public minutes: number = 0;
  public active: boolean = true;
  public companyId: number = 0;
  public dayOfWeek: string | null = null;
  public eventDate: Date | null = null;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public recurring: boolean = true;
}
//const obj = Object.assign(new CompanyWorkingHour(), { description: 'Morning Shift' });
/*export class CompanyWorkingHour {
  constructor(
    public id: number = 0,
    public description: string = '',
    public scope: WorkingHourEnum = WorkingHourEnum.DEFAULT,
    public minutes: number = 0,
    public active: boolean = true,
    public companyId: number = 0,
    public dayOfWeek: string | null = null,
    public eventDate: Date | null = null,
    public startDate: Date | null = null,
    public endDate: Date | null = null,
    public recurring: boolean = false
  ) {}
}*/

export enum EventTypeEnum {
  HOLIDAY,
  WORKDAY,
  MEETING,
  COMPANY_EVENT
}
export class CompanyCalendar {
  public id: number = 0;
  public eventName: string = '';
  public eventType: EventTypeEnum = EventTypeEnum.HOLIDAY;
  public active: boolean = true;
  public companyId: number = 0;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public recurring: boolean = true;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private baseUrl = AppConstants.API_URL;
  private companyWeekend = this.baseUrl+'/companyWeekends'; // Base URL for the REST endpoint
  private companyWorkingHour = this.baseUrl+'/companyWorkingHours'; // Base URL for the REST endpoint
  private companyCalendar = this.baseUrl+'/companyCalendars'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
  }
  getWeekendByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.companyWeekend}/search/findByCompanyIdAndActive?companyId=${companyId}&active=1&sort=day,asc`).pipe(
      catchError(handleError)
    );
  }
  // Get by ID
  getCWById(id: number): Observable<CompanyWeekend> {
    return this.http.get<CompanyWeekend>(`${this.companyWeekend}/${id}`).pipe(
      catchError(handleError)
    );
  }
  createCW(model: CompanyWeekend): Observable<CompanyWeekend> {
    const { id, ...payload } = model;
    return this.http.post<CompanyWeekend>(this.companyWeekend, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  updateCW(pkId: number, model: CompanyWeekend): Observable<CompanyWeekend> {
    const { id, ...payload } = model;
    return this.http.put<CompanyWeekend>(`${this.companyWeekend}/${pkId}`, payload).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  deleteCW(id: number): Observable<void> {
    return this.http.delete<void>(`${this.companyWeekend}/${id}`).pipe(
      catchError(handleError)
    );
  }




  getWorkingHoursByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.companyWorkingHour}/search/findByCompanyIdAndActive?companyId=${companyId}&active=1&sort=day,asc`).pipe(
      catchError(handleError)
    );
  }
  // Get by ID

  createWorkingHour(model: CompanyWorkingHour): Observable<CompanyWorkingHour> {
    const { id, ...payload } = model;
    return this.http.post<CompanyWorkingHour>(this.companyWorkingHour, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  updateWorkingHour(pkId: number, model: CompanyWorkingHour): Observable<CompanyWorkingHour> {
    const { id, ...payload } = model;
    return this.http.put<CompanyWorkingHour>(`${this.companyWorkingHour}/${pkId}`, payload).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  deleteWorkingHour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.companyWorkingHour}/${id}`).pipe(
      catchError(handleError)
    );
  }




  getCompanyCalendarsByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.companyCalendar}/search/findByCompanyIdAndActive?companyId=${companyId}&active=1&sort=day,asc`).pipe(
      catchError(handleError)
    );
  }
  // Get by ID

  createCompanyCalendar(model: CompanyCalendar): Observable<CompanyCalendar> {
    const { id, ...payload } = model;
    return this.http.post<CompanyCalendar>(this.companyCalendar, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  updateCompanyCalendar(pkId: number, model: CompanyCalendar): Observable<CompanyCalendar> {
    const { id, ...payload } = model;
    return this.http.put<CompanyCalendar>(`${this.companyCalendar}/${pkId}`, payload).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  deleteCompanyCalendar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.companyCalendar}/${id}`).pipe(
      catchError(handleError)
    );
  }

}
