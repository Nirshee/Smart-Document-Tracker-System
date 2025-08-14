import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '../../core/services/jwt.service';

interface MenuItem {
  path: string;
  icon: string;
  title: string;
  requiredRoles?: string[]; 
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  
  allMenuItems: MenuItem[] = [
    { path: '/dashboard', icon: 'dashboard', title: 'Dashboard' },
    { path: '/documents', icon: 'folder', title: 'Documents' },
    { 
      path: '/user', 
      icon: 'group', 
      title: 'User Management', 
      requiredRoles: ['1'] // Only visible to users with role '1' (admin)
    },
    { path: '/audit', icon: 'assessment', title: 'Audit Logs' },
  ];

  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.filterMenuItems();
  }

 
  private filterMenuItems(): void {
    try {
      const currentUser = this.jwtService.getCurrentUser();
      
      if (!currentUser) {
        // If no user data, show only basic items
        this.menuItems = this.allMenuItems.filter(item => !item.requiredRoles);
        return;
      }

      this.menuItems = this.allMenuItems.filter(item => {
        // If no required roles specified, show the item
        if (!item.requiredRoles || item.requiredRoles.length === 0) {
          return true;
        }

        // Check if user has any of the required roles
        return this.jwtService.hasRole(item.requiredRoles);
      });

      console.log('Current user role:', currentUser.role);
      console.log('Filtered menu items:', this.menuItems);
      
    } catch (error) {
      console.error('Error filtering menu items:', error);
      // Fallback: show only items without role requirements
      this.menuItems = this.allMenuItems.filter(item => !item.requiredRoles);
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  /**
   * Helper method to check if current user can access a specific menu item
   * This can be used in template for additional checks if needed
   */
  canAccessMenuItem(menuItem: MenuItem): boolean {
    if (!menuItem.requiredRoles || menuItem.requiredRoles.length === 0) {
      return true;
    }
    
    return this.jwtService.hasRole(menuItem.requiredRoles);
  }

  /**
   * Get current user's role for debugging or display purposes
   */
  getCurrentUserRole(): string {
    const currentUser = this.jwtService.getCurrentUser();
    return currentUser?.role || 'Unknown';
  }
}