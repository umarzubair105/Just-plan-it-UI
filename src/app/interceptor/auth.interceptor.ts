import {HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import { inject } from '@angular/core';
import {AuthService} from '../services/auth.service';
import { Observable, tap,throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('authInterceptor In filter');
  const authService = inject(AuthService);
  const token = authService.getToken(); // Retrieve the token from storage
  console.log('authInterceptor In filter'+token);
  if (token) {
    // Clone the request and add the Authorization header
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        TestH: 'TestHeader' // Add custom header
      },
      //withCredentials: true
    });
    //return next(clonedReq);

    return next(clonedReq).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // Successful responses (status code 2xx)
            console.log('Response Status:', event.status);
            console.log('Response Body:', event.body);
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 0) {
            authService.logout();
            // Handle status 0 (network or CORS error)
            console.error('An error occurred:', error.error);
            //alert('A network error occurred. Please check your connection or CORS settings or token is expired.');
          } else {
            // Handle other HTTP errors
            console.error(
              `Backend returned code ${error.status}, body was: `,
              error.error
            );
          }
          //return throwError(error);
          //return throwError(() => new Error('Something bad happened; please try again later.'))
        }
      })
    );
/*    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('authInterceptor Error Status:', error.status);
        console.log('authInterceptor Error:', error);
        if (error.status === 401 || error.status === 403) {
          // Handle the error by redirecting to the login page
          authService.clearToken();
          window.location.href = '/login'; // Or use router.navigate(['/login']);
        }
        return throwError(error);
      })
    );*/
  }
  return next(req);
};
/*
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('In filter');
    const token = localStorage.getItem('token'); // Retrieve the token from storage
    // Get the auth token from the service.
    //const authToken = 'your-auth-token'; // Replace with actual token retrieval logic

    if (token) {
      // Clone the request and add the Authorization header
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(clonedReq);
    }
    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    //const authReq = req.clone({
    //  headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    //});

    // Send the cloned request to the next handler.
    return next.handle(req);
  }
}*/
/*
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
*/

