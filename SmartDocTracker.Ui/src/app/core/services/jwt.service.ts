// core/services/jwt.service.ts
import { Injectable } from '@angular/core';

export interface DecodedToken {
  sub: string;
  jti: string;
  iat: number;
  Id: string;
  Username: string;
  Role: string;
  Email: string;
  exp: number;
  iss: string;
  aud: string;
}

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() { }

  /**
   * Decode JWT token without verification (client-side only)
   * @param token JWT token string
   * @returns Decoded token payload or null if invalid
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      // JWT has 3 parts separated by dots: header.payload.signature
      const parts = cleanToken.split('.');
      
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + '==='.slice(0, (4 - payload.length % 4) % 4);
      
      // Decode base64
      const decodedPayload = atob(paddedPayload);
      
      // Parse JSON
      const tokenData = JSON.parse(decodedPayload) as DecodedToken;
      
      return tokenData;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Get current user's token from localStorage and decode it
   * @returns Decoded token or null
   */
  getCurrentUserToken(): DecodedToken | null {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  /**
   * Check if current user has specified role(s)
   * @param allowedRoles Array of allowed role strings
   * @returns boolean
   */
  hasRole(allowedRoles: string[]): boolean {
    const decodedToken = this.getCurrentUserToken();
    if (!decodedToken || !decodedToken.Role) {
      return false;
    }
    return allowedRoles.includes(decodedToken.Role);
  }

  /**
   * Check if current user is an admin (Role 1)
   * @returns boolean
   */
  isAdmin(): boolean {
    return this.hasRole(['1']);
  }

  /**
   * Check if current user is a manager (Role 1 or 2)
   * @returns boolean
   */
  isManager(): boolean {
    return this.hasRole(['1', '2']);
  }

  /**
   * Check if current user can upload documents (Role 1 or 2)
   * @returns boolean
   */
  canUploadDocuments(): boolean {
    return this.hasRole(['1', '2']);
  }

  /**
   * Check if current user can manage users (Role 1 only - admin)
   * @returns boolean
   */
  canManageUsers(): boolean {
    return this.hasRole(['1']);
  }

  /**
   * Check if current user can delete documents (Role 1 or 2)
   * @returns boolean
   */
  canDeleteDocuments(): boolean {
    return this.hasRole(['1', '2']);
  }

  /**
   * Get current user information
   * @returns User info object or null
   */
  getCurrentUser(): { id: string; username: string; email: string; role: string } | null {
    const decodedToken = this.getCurrentUserToken();
    if (!decodedToken) {
      return null;
    }

    return {
      id: decodedToken.Id,
      username: decodedToken.Username,
      email: decodedToken.Email,
      role: decodedToken.Role
    };
  }

  /**
   * Get user role name for display purposes
   * @returns string
   */
  getCurrentUserRoleName(): string {
    const roleMap: { [key: string]: string } = {
      '1': 'Administrator',
      '2': 'Manager', 
      '3': 'User'
    };
    
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return 'Guest';
    }
    
    return roleMap[currentUser.role] || `Role ${currentUser.role}`;
  }

  /**
   * Check if token is expired
   * @returns boolean
   */
  isTokenExpired(): boolean {
    const decodedToken = this.getCurrentUserToken();
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  }

  /**
   * Get token expiration date
   * @returns Date object or null
   */
  getTokenExpirationDate(): Date | null {
    const decodedToken = this.getCurrentUserToken();
    if (!decodedToken || !decodedToken.exp) {
      return null;
    }

    // Convert seconds to milliseconds
    return new Date(decodedToken.exp * 1000);
  }

  /**
   * Log current user information for debugging
   */
  debugUserInfo(): void {
    const user = this.getCurrentUser();
    const roleName = this.getCurrentUserRoleName();
    
    console.group('🔐 Current User Information');
    console.log('User:', user);
    console.log('Role Name:', roleName);
    console.log('Is Admin:', this.isAdmin());
    console.log('Is Manager:', this.isManager());
    console.log('Can Upload:', this.canUploadDocuments());
    console.log('Can Manage Users:', this.canManageUsers());
    console.log('Can Delete:', this.canDeleteDocuments());
    console.log('Token Expired:', this.isTokenExpired());
    console.groupEnd();
  }
}