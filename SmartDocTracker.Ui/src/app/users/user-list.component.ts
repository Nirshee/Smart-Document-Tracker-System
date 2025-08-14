// users/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, UserDetail, Role, UpdateUserRequest, AddUserDetail, AddUserRequest } from '../core/services/user.service';
import { JwtService } from '../core/services/jwt.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserListComponent implements OnInit {
  users: UserDetail[] = [];
  selectedUsers: Set<string> = new Set();
  isLoading = false;
  
  
  // Edit modal
  showEditModal = false;
  editForm: FormGroup;
  roles: Role[] = [];
  isLoadingRoles = false;
  isUpdating = false;
  updateError = '';
  updateSuccess = '';
  userToEdit: UserDetail | null = null;


  // Add modal
  showAddModal = false;
  addForm: FormGroup;
  userToAdd: AddUserDetail | null = null;

  // Permissions
  canManageUsers = false;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });

    this.addForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(16)]]
    });
  }

  ngOnInit(): void {
    this.checkUserPermissions();
    this.loadUsers();
  }

  // Check if user has permission to manage users (Role 1 or 2)
  checkUserPermissions(): void {
    this.canManageUsers = this.jwtService.hasRole(['1', '2']);
  }

  // Load all users
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  // Handle checkbox selection
  onUserSelect(userId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedUsers.add(userId);
    } else {
      this.selectedUsers.delete(userId);
    }
  }

  // Check if user is selected
  isUserSelected(userId: string): boolean {
    return this.selectedUsers.has(userId);
  }

  // Get count of selected users
  getSelectedCount(): number {
    return this.selectedUsers.size;
  }

  // Clear all selections
  clearSelections(): void {
    this.selectedUsers.clear();
  }

  // Edit selected user (only works if exactly one user is selected)
  editSelectedUser(): void {
    if (this.selectedUsers.size !== 1) {
      return;
    }

    const selectedUserId = Array.from(this.selectedUsers)[0];
    const userToEdit = this.users.find(user => user.id === selectedUserId);
    
    if (userToEdit) {
      this.openEditModal(userToEdit);
    }
  }

  // Open edit modal
  openEditModal(user: UserDetail): void {
    this.userToEdit = user;
    this.showEditModal = true;
    this.updateError = '';
    this.updateSuccess = '';
    
    // Pre-fill form with current user data
    this.editForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      role: user.roleId
    //   '' // We'll set this after loading roles
    });
    
    this.loadRoles();
  }

  // Close edit modal
  closeEditModal(): void {
    this.showEditModal = false;
    this.userToEdit = null;
    this.editForm.reset();
    this.updateError = '';
    this.updateSuccess = '';
    this.roles = [];
  }


  // Add user
  AddSelectedUser(): void {
      const newUser: AddUserDetail = {
        fullName: '',
        email: '',
        password: ''
      };
      this.openAddModal(newUser);
  }

  // Open add modal
  openAddModal(user: AddUserDetail): void {
    this.userToAdd = user;
    this.showAddModal = true;
    this.updateError = '';
    this.updateSuccess = '';
    
    // Pre-fill form with current user data
    this.addForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      password: user.password
    });
  }

  // Close add modal
  closeAddModal(): void {
    this.showAddModal = false;
    this.userToAdd = null;
    this.addForm.reset();
    this.updateError = '';
    this.updateSuccess = '';
  }

  // Load roles for dropdown
  loadRoles(): void {
    this.isLoadingRoles = true;
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoadingRoles = false;
        
        // Try to set current user's role if we can determine it
        // Note: The API doesn't return current role, so we'll leave it empty for user to select
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.updateError = 'Failed to load roles. Please try again.';
        this.isLoadingRoles = false;
      }
    });
  }

  // Update user
  updateUser(): void {
    if (this.editForm.invalid || !this.userToEdit) {
      return;
    }

    this.isUpdating = true;
    this.updateError = '';

    const formValue = this.editForm.value;
    const updateData: UpdateUserRequest = {
      id: this.userToEdit.id,
      fullName: formValue.fullName,
      email: formValue.email,
      role: formValue.role.toString()
    };

    this.userService.updateUser(updateData).subscribe({
      next: (response) => {
        this.updateSuccess = 'User updated successfully!';
        this.isUpdating = false;
        
        // Update the user in the local list
        const userIndex = this.users.findIndex(u => u.id === this.userToEdit!.id);
        if (userIndex !== -1) {
          this.users[userIndex] = {
            ...this.users[userIndex],
            fullName: formValue.fullName,
            email: formValue.email
          };
        }
        
        // Clear selection
        this.selectedUsers.clear();
        
        // Close modal after a delay
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.updateError = error.error?.message || 'Update failed. Please try again.';
        this.isUpdating = false;
      }
    });
  }

  // Add user
  addUser(): void {
    this.isUpdating = true;
    this.updateError = '';

    const formValue = this.addForm.value;
    const addData: AddUserRequest = {
      username: formValue.fullName,
      email: formValue.email,
      password: formValue.password
    };

    this.userService.addUser(addData).subscribe({
      next: (response) => {
        this.updateSuccess = 'User added successfully!';
        this.isUpdating = false;
        this.loadUsers();
        // Close modal after a delay
        setTimeout(() => {
          this.closeAddModal();
        }, 1500);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.updateError = error.error?.message || 'User Creation failed. Please try again.';
        this.isUpdating = false;
      }
    });
  }

  // Get role name by ID for display
  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }

  // Track by function for better performance
  trackByUserId(index: number, user: UserDetail): string {
    return user.id;
  }

  // Form field error checking
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least 2 characters`;
    }
    return '';
  }
}