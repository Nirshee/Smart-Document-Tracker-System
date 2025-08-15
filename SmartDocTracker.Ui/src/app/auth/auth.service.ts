// auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { JwtService } from '../core/services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5200'; 

  constructor(
    private http: HttpClient, 
    private router: Router,
    private jwtService: JwtService
  ) {}

  login(Email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { Email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          
          // Optional: Log user info after successful login
          const userInfo = this.jwtService.getCurrentUser();
          if (userInfo) {
            console.log('Logged in as:', userInfo);
          }
          
          this.router.navigate(['/dashboard']);
        })
      );
  }
  signUp(username: string, Email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, { username, Email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          
          // Optional: Log user info after successful login
          const userInfo = this.jwtService.getCurrentUser();
          if (userInfo) {
            console.log('Logged in as:', userInfo);
          }
        })
      );
  }

  register(Email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { Email, password });
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    return !this.jwtService.isTokenExpired();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Get current user information
  getCurrentUser() {
    return this.jwtService.getCurrentUser();
  }

  // Check if current user has specific role(s)
  hasRole(allowedRoles: string[]): boolean {
    return this.jwtService.hasRole(allowedRoles);
  }

  // Check if current user can upload documents
  canUploadDocuments(): boolean {
    return this.jwtService.canUploadDocuments();
  }
}