import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AppConstants} from '../configuration/app.constants';


export enum ReleaseIteration {
  ANNUAL="ANNUAL",
  SEMI_ANNUAL = "SEMI_ANNUAL",
  QUARTERLY = "QUARTERLY",
  BI_MONTHLY = "BI-MONTHLY",
  MONTHLY = "MONTHLY",
  TRI_WEEKLY = "TRI-WEEKLY",
  BI_WEEKLY = "BI-WEEKLY",
  WEEKLY = "WEEKLY",
}
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(AppConstants.TOKEN_KEY) !== null;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unknown error occurred!';
  console.error('>>>>>');
  console.error(error);
  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else  if (error.error && error.error.message) {
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Server-side error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  return throwError(errorMessage);
}
