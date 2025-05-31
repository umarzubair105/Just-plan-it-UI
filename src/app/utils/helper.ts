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

export function getLocalDate(): Date {
  const today = new Date();
  // Create YYYY-MM-DD string in local time
  const localDateString = today.toISOString().split('T')[0];
  return new Date(localDateString);
}

export function convertToMinutes(timeString: string): number {

  let totalMinutes = 0;

  //const dayMatch = timeString.match(/(\d+)\s*d/);
  const hourMatch = timeString.match(/(\d+)\s*h/);
  const minuteMatch = timeString.match(/(\d+)\s*m/);

  //if (dayMatch) {
    //totalMinutes += parseInt(dayMatch[1], 10) * 24 * 60;
  //}
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }
  return totalMinutes;

}
export function transformToDhM(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return 'Invalid time';
  }

  //const days = Math.floor(totalMinutes / (24 * 60));
  //const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  //const minutes = totalMinutes % 60;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${totalMinutes}m`;

  let result = '';
  //if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;



  return result.trim();
}
