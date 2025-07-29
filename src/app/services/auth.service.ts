import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AppConstants} from '../configuration/app.constants';
import {AuthResponse, ResourceRightBean} from '../models/basic';
import {catchError} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {handleError} from '../utils/helper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = AppConstants.TOKEN_KEY;  // Key used to store the JWT
  private readonly baseUrlComDashboard = AppConstants.API_URL+'/company-dashboard'; // Base URL for the REST endpoint
  private userNameSubject = new BehaviorSubject<string | null>(null);
  userName$: Observable<string | null> = this.userNameSubject.asObservable();
  private http = inject(HttpClient);

  constructor() {
    console.log('AuthService constructor');
    // Load username from local storage when the app starts
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) {
      this.userNameSubject.next(storedUser);
    }
    console.log('AuthService constructor:'+storedUser);
  }
  getResourceRights(): Observable<ResourceRightBean> {
    const resourceId = this.getUserId();
    return this.http.get<ResourceRightBean>(`${this.baseUrlComDashboard}/get-rights?resourceId=${resourceId}`).pipe(
      catchError(handleError)
    );
  }
  getResourceRightsByProductId(productId: number): Observable<ResourceRightBean> {
    const resourceId = this.getUserId();
    return this.http.get<ResourceRightBean>(`${this.baseUrlComDashboard}/get-rights?resourceId=${resourceId}&productId=${productId}`).pipe(
      catchError(handleError)
    );
  }
  // Call this method after user logs in
  login(resp: AuthResponse) {
    this.saveToken(resp.token);
    var decodedT = this.decodeToken(resp.token);
    var userName = decodedT.name;
    localStorage.setItem('loggedUser', userName);
    localStorage.setItem('userId', decodedT.id);
    localStorage.setItem('companyId', decodedT.companyId);
    localStorage.setItem('companyName', decodedT.companyName);
    localStorage.setItem('companyType', resp.details.company.type);
    localStorage.setItem('email', decodedT.email);
    console.log('AuthService login:'+userName);
    this.userNameSubject.next(userName);
  }

  // Call this method when user logs out
  logout() {
    this.clearToken();
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyType');
    localStorage.removeItem('email');
    localStorage.removeItem('productId');
    sessionStorage.removeItem('wizard');
    this.userNameSubject.next(null);
  }

  // Get the current logged-in user
  getUserName(): string | null {
    return localStorage.getItem('loggedUser');
  }
  getUserId(): number {
    if (localStorage.getItem('userId'))
      return Number(localStorage.getItem('userId'));
    else
      return 0;
  }
  getCompanyId(): number {
    if (localStorage.getItem('companyId'))
      return Number(localStorage.getItem('companyId'));
    else
      return 0;
  }
  getCompanyType(): string | null {
    if (localStorage.getItem('companyType'))
      return localStorage.getItem('companyType');
    else
      return '';
  }
  getEmail(): string | null {
    return localStorage.getItem('email');
  }
  getCompanyName(): string | null {
    return localStorage.getItem('companyName');
  }
  // Save JWT token in localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }


  // Retrieve JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Clear the token from storage
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];  // JWT format: header.payload.signature
      return JSON.parse(atob(payload));  // Decode Base64
/*
      exp        :        1739818889
      iat        :        1738954889
      sub        :        "user"*/
    } catch (error) {
      return null;  // Return null if invalid token
    }
  }

  setSelectedProductId(productId: number) {
    localStorage.setItem('productId', ''+productId);
  }
  getSelectedProductId(): number {
    if (localStorage.getItem('productId'))
      return Number(localStorage.getItem('productId'));
    else
      return 0;
  }
  // 🔹 6. Get User Role from JWT Token
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.role || null;  // Extract 'role' claim from token
    }
    return null;
  }

  // 🔹 7. Check if Token is Expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);  // Convert to seconds
      return decoded?.exp < currentTime;  // Check if token expiration is past current time
    }
    return true;
  }
}
