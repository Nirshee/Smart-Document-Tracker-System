// services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
  id: string;
  title: string;
  filePath: string;
  uploadedById: string;
  uploadDate: string;
  isEncrypted: boolean;
  isConverted: boolean;
  status: string;
  uploadedBy: any; // You might want to create a proper User interface
}

export interface DocumentViewResponse {
  document: string;
  base64: string;
}

export interface DocumentUploadRequest {
  fileBase64: string;
  fileName: string;
  status: string;
  assignedToId: string;
}

export interface User {
  id: string;
  fullName: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
}

export interface DocumentStatusUpdate {
  id: string;
  status: string;
  comments: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:5200/api/documents';
  private baseUrl = 'http://localhost:5200/api';


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

  getDocuments(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      uploadedById?: string;
      search?: string;
    }
  ): Observable<Document[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.uploadedById) params = params.set('uploadedById', filters.uploadedById);
      if (filters.search) params = params.set('search', filters.search);
    }

    const headers = this.getAuthHeaders();

    return this.http.get<Document[]>(this.apiUrl, { params, headers });
  }

  viewDocument(documentId: string): Observable<DocumentViewResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<DocumentViewResponse>(`${this.apiUrl}/${documentId}`, { headers });
  }

  getUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<User[]>('http://localhost:5200/api/users/user/Getuser', { headers });
  }

  uploadDocument(uploadData: DocumentUploadRequest): Observable<DocumentUploadResponse> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<DocumentUploadResponse>(`${this.apiUrl}/upload`, uploadData, { headers });
  }

  deleteDocument(documentId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${documentId}`, { headers });
  }

updateDocumentStatus(data: DocumentStatusUpdate): Observable<any> {
  const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
  return this.http.put(`${this.baseUrl}/documents/UpdateDocstatus`, data,  { headers });
}

  downloadDocument(documentId: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/${documentId}/download`, {
      headers,
      responseType: 'blob'
    });
  }
}