import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {Release, ReleaseStatusEnum} from '../models/planning';
import {Resource} from '../models/basic';
import {CommonResp} from './company.service';


@Injectable({
  providedIn: 'root',
})
export class ReleaseService {
  private readonly baseUrl = AppConstants.API_URL+'/releases'; // Base URL for the REST endpoint
  private readonly planUrl = AppConstants.API_URL+'/planning-dashboard'; // Base URL for the REST endpoint
  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Release> {
    return this.http.get<Release>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }
  getByProductIdAndStatuses(productId:number, status: ReleaseStatusEnum[]): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    status.forEach(s => params = params.append('status', s));
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByProductIdAndStatusInAndActiveIsTrueOrderByStartDateAsc`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  updateSpecificFieldsPasses(id: number, fieldsToUpdate: Partial<{}>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, fieldsToUpdate).pipe(
      catchError(handleError)
    );
  }
  startRelease(id: number): Observable<CommonResp> {
    return this.http.post<CommonResp>(`${this.planUrl}/startRelease?releaseId=${id}`,{}).pipe(
      catchError(handleError)
    );
  }

  completeRelease(id: number): Observable<CommonResp> {
    return this.http.post<CommonResp>(`${this.planUrl}/completeRelease?releaseId=${id}`,{}).pipe(
      catchError(handleError)
    );
  }
}
