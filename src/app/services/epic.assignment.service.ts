import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {ReleaseStatusEnum} from '../models/planning';


@Injectable({
  providedIn: 'root',
})
export class EpicAssignmentService {
  private readonly baseUrl = AppConstants.API_URL+'/epicAssignments'; // Base URL for the REST endpoint
  constructor(private http: HttpClient) {}


  updateSpecificFieldsPasses(id: number, fieldsToUpdate: Partial<{}>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, fieldsToUpdate).pipe(
      catchError(handleError)
    );
  }
}
