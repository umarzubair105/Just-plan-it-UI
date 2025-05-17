import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {Epic, EpicBean, ReleaseStatusEnum, ScheduleEpic, TimeLogging} from '../models/planning';

// Def


@Injectable({
  providedIn: 'root',
})
export class TimeLoggingService {
  private readonly baseUrl = AppConstants.API_URL+'/timeLoggings'; // Base URL for the REST endpoint

  constructor(private readonly http: HttpClient) {}

  getUnplannedByProductId(productId:number): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByProductIdAndReleaseIdIsNullAndActiveIsTrue`,
      { params }).pipe(
      catchError(handleError)
    );
  }


  // Get by ID

  create(model: TimeLogging): Observable<Epic> {
    const { id, ...payload } = model;
    return this.http.post<Epic>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  delete(id: number): Observable<any> {
    const updatedFields = { active: false };
    return this.http.patch(`${this.baseUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }




}
