import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {
  Epic,
  EpicAssignmentBean,
  EpicBean,
  EpicEstimate,
  EpicEstimateBean,
  ReleaseStatusEnum
} from '../models/planning';

// Def


@Injectable({
  providedIn: 'root',
})
export class EpicEstimateService {
  private readonly baseUrl = AppConstants.API_URL+'/epicEstimates'; // Base URL for the REST endpoint
  private readonly epicsUrl = AppConstants.API_URL+'/epics'; // Base URL for the REST endpoint


  constructor(private readonly http: HttpClient) {}

  // Get by ID

  create(model: EpicEstimate): Observable<EpicEstimate> {
    const { id, ...payload } = model;
    return this.http.post<EpicEstimate>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pid: number, model: EpicEstimate): Observable<EpicEstimate> {
    const { id, ...payload } = model;
    return this.http.put<EpicEstimate>(`${this.baseUrl}/${pid}`, payload).pipe(
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
    //const updatedFields = { active: false };
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

  getPossibleEpicEstimateByEpicId(epicId:number): Observable<EpicEstimateBean[]> {
    return this.http.get<EpicEstimateBean[]>(`${this.epicsUrl}/findPossibleEpicEstimateByEpicId?id=${epicId}`).pipe(
      catchError(handleError)
    );
  }



}
