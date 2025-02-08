import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import { inject } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {catchError} from 'rxjs/operators';
import { throwError } from 'rxjs';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); // Retrieve the token from storage
  console.log('In filter'+token);
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
      catchError((error: HttpErrorResponse) => {
        console.log('Error Sttaus:', error.status);
        console.log('Error:', error);
        if (error.status === 401 || error.status === 403) {
          // Handle the error by redirecting to the login page
          authService.clearToken();
          window.location.href = '/login'; // Or use router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
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

