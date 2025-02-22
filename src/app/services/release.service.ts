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
export class ReleaseService {
  private readonly baseUrl = AppConstants.API_URL+'/releases'; // Base URL for the REST endpoint
  constructor(private http: HttpClient) {}

  getByProductIdAndStatuses(productId:number, status: ReleaseStatusEnum[]): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    status.forEach(s => params = params.append('status', s));
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByProductIdAndStatusInAndActiveIsTrueOrderByStartDateAsc`,
      { params }).pipe(
      catchError(handleError)
    );
  }

}
