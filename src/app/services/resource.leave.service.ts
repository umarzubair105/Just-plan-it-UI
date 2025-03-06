import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {ResourceLeave} from '../models/basic';
import {handleError} from '../utils/helper';
import {AppConstants} from '../configuration/app.constants';

// Define the interface



@Injectable({
  providedIn: 'root',
})
export class ResourceLeaveService {
  private baseUrl = AppConstants.API_URL+'/resourceLeaves'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
  }
  getByResourceId(resourceId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByResourceIdAndActiveIsTrue?resourceId=${resourceId}`).pipe(
      catchError(handleError)
    );
  }
  // Get by ID


  // Create a new Role
  create(model: ResourceLeave): Observable<ResourceLeave> {
    const { id, ...payload } = model;
    return this.http.post<ResourceLeave>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pkId: number, model: ResourceLeave): Observable<ResourceLeave> {
    const { id, ...payload } = model;
    return this.http.put<ResourceLeave>(`${this.baseUrl}/${pkId}`, payload).pipe(
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
    const updatedFields = {active: false};
    return this.http.patch(`${this.baseUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }

}
