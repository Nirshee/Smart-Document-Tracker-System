import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditDetail {
  id: string;
  fullName: string;
  documentName: string;
  action: string;
  timestamp: any;
}



@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'http://localhost:5200/api';

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
  getAllUsers(): Observable<AuditDetail[]> {
      const headers = this.getAuthHeaders();
      return this.http.get<AuditDetail[]>(`${this.apiUrl}/audit`, { headers });
    }

    getDashboardStats(): Observable<{ totaluploaddoc: number, totaldeleteddoc: number, totalvieweddoc: number }> {
  const headers = this.getAuthHeaders();
  return this.http.get<{ totaluploaddoc: number, totaldeleteddoc: number, totalvieweddoc: number }>(
    `${this.apiUrl}/lookup/Dashboard`,
    { headers }
  );
}

}