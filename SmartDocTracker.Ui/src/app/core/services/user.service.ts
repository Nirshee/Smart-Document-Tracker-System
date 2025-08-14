// core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
}

export interface AddUserDetail {
  fullName: string;
  email: string;
  password: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface UpdateUserRequest {
  id: string;
  fullName: string;
  role: string;
  email: string;
}
export interface AddUserRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5200/api';
  private RegapiUrl = 'http://localhost:5200';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // Get all users
  getAllUsers(): Observable<UserDetail[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDetail[]>(`${this.apiUrl}/users/user/Getalluser`, { headers });
  }

  // Get roles for dropdown
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/lookup/roles`);
  }

  // Update user
  updateUser(userData: UpdateUserRequest): Observable<any> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.put(`${this.apiUrl}/users/me`, userData, { headers });
  }
  // Add user
  addUser(userData: AddUserRequest): Observable<any> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.RegapiUrl}/register`, userData, { headers });
  }
}