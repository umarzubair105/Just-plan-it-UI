import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';  // Key used to store the JWT

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
