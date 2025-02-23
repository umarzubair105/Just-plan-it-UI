import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {Epic, EpicBean, ReleaseStatusEnum} from '../models/planning';

// Def


@Injectable({
  providedIn: 'root',
})
export class EpicService {
  private readonly baseUrl = AppConstants.API_URL+'/epics'; // Base URL for the REST endpoint
  private readonly planningDashboardUrl = AppConstants.API_URL+'/planning-dashboard'; // Base URL for the REST endpoint

  constructor(private readonly http: HttpClient) {}

  getUnplannedByProductId(productId:number): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByProductIdAndReleaseIdIsNullAndActiveIsTrue`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  getUnplannedEpicBeansByProductId(companyId:number,productId:number): Observable<EpicBean[]> {
    let params = new HttpParams();
    params = params.append('companyId', companyId);
    params = params.append('productId', productId);
    return this.http.get<EpicBean[]>(`${this.planningDashboardUrl}/findUnplannedEpics`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  getByReleaseId(releaseId:number): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('releaseId', releaseId);
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByReleaseIdAndActiveIsTrue`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  // Get by ID

  create(model: Epic): Observable<Epic> {
    const { id, ...payload } = model;
    return this.http.post<Epic>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pid: number, model: Epic): Observable<Epic> {
    const { id, ...payload } = model;
    return this.http.put<Epic>(`${this.baseUrl}/${pid}`, payload).pipe(
      catchError(handleError)
    );
  }

  updateSpecificFields(id: number, fieldsToUpdate: Partial<{ status: string; startDate: string }>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, fieldsToUpdate).pipe(
      catchError(handleError)
    );
  }
  updateSpecificFieldsPasses(id: number, fieldsToUpdate: Partial<{}>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, fieldsToUpdate).pipe(
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
