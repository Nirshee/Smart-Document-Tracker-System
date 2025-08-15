import { Component, OnInit } from '@angular/core';
import { DocumentService, Document, DocumentViewResponse, User } from '../core/services/document.service';
import { JwtService } from '../core/services/jwt.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PdfViewerModule } from "ng2-pdf-viewer";
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor
    ReactiveFormsModule, // For formGroup
    FormsModule, // For ngModel
    DatePipe, // For date pipe
    RouterModule, // For routerLink if used
    PdfViewerModule,
    NgxPaginationModule
  ]
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  allDocuments: Document[] = []; // Store all documents for client-side filtering
  currentPage = 1;
  pageSize = 10;
  // totalItems = 0;
  isLoading = false;

   // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  
  // Modal properties
  showModal = false;
  currentDocumentTitle = '';
  pdfUrl = '';
  isLoadingPdf = false;
  pdfBase64 = '';

  // Upload Modal properties
  showUploadModal = false;
  isDragOver = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadError = '';
  uploadSuccess = '';
  users: User[] = [];
  selectedUserId = '';
  isLoadingUsers = false;
  
  // User permissions
  canUpload = false;
  canDelete = false;
  
  // Delete confirmation
  showDeleteConfirmation = false;
  documentToDelete: Document | null = null;
  isDeleting = false;

  // Approval confirmation
  showApprovalConfirmation = false;
  documentToApprove: Document | null = null;
  isUpdatingStatus = false;

  // Rejection confirmation
  showRejectionConfirmation = false;
  documentToReject: Document | null = null;
  rejectionComments = '';

  filterForm: FormGroup;
  statusOptions: { value: string; label: string }[] = [];

  constructor(
    private documentService: DocumentService,
    private fb: FormBuilder,
    private router: Router,
    private jwtService: JwtService
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      uploadedById: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    // Check user permissions
    this.checkUserPermissions();
    
    this.loadDocuments();
    
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  loadDocuments(): void {
    this.isLoading = true;
    
    // Only make API call without any filters to get all documents
    this.documentService.getDocuments(1, 1000) // Get a large number to get all documents
      .subscribe({
        next: (documents: Document[]) => {
          this.allDocuments = documents;
          this.totalItems = documents.length; // <-- Set the total number of items
          this.generateStatusOptions();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading documents', error);
          this.isLoading = false;
        }
      });
  }

  // Generate status options dynamically based on available documents
  generateStatusOptions(): void {
    const uniqueStatuses = [...new Set(this.allDocuments.map(doc => doc.status))];
    this.statusOptions = uniqueStatuses.map(status => ({
      value: status.toLowerCase(),
      label: this.capitalizeFirst(status)
    }));
  }

  // Helper method to capitalize first letter
  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Apply filters locally without API calls
  applyFilters(): void {
    const filters = this.filterForm.value;
    let filteredDocuments = [...this.allDocuments];

    // Filter by status
    if (filters.status) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Filter by uploader ID
    if (filters.uploadedById) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.uploadedById && doc.uploadedById.toLowerCase().includes(filters.uploadedById.toLowerCase())
      );
    }

    // Filter by search (search in title)
    if (filters.search) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply pagination
    this.totalItems = filteredDocuments.length;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.documents = filteredDocuments.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.applyFilters(); // Apply filters instead of loading documents
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.applyFilters(); // Apply filters instead of loading documents
  }

  // Track by function for better performance with *ngFor
  trackByDocId(index: number, doc: Document): string {
    return doc.id;
  }

  viewDocument(docId: string): void {
    const document = this.allDocuments.find(doc => doc.id === docId);
    if (!document) {
      console.error('Document not found');
      return;
    }

    this.currentDocumentTitle = document.title;
    this.isLoadingPdf = true;
    this.showModal = true;

    this.documentService.viewDocument(docId).subscribe({
      next: (response: DocumentViewResponse) => {
        if (response.base64) {
          // No need to convert to Blob — use base64 directly
          this.pdfBase64 = 'data:application/pdf;base64,' + response.base64;
        } else {
          console.error('No base64 data found in response');
          this.pdfBase64 = 'null';
        }

        this.isLoadingPdf = false;
      },
      error: (error: any) => {
        console.error('Error loading PDF:', error);
        this.isLoadingPdf = false;
        this.pdfBase64 = 'null';
      }
    });
  }

  // Close modal method
  closeModal(): void {
    this.showModal = false;
    
    // Clean up blob URL to prevent memory leaks
    if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.pdfUrl);
    }
    
    this.pdfUrl = '';
    this.currentDocumentTitle = '';
    this.isLoadingPdf = false;
  }

  // Get current document ID for download
  getCurrentDocumentId(): string {
    const currentDoc = this.allDocuments.find(doc => doc.title === this.currentDocumentTitle);
    return currentDoc ? currentDoc.id : '';
  }

  // Download current PDF from modal
  downloadCurrentPdf(): void {
    if (this.pdfBase64) {
      const link = document.createElement('a');
      link.href = this.pdfBase64;
      link.download = `${this.currentDocumentTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  //Upload document method
  uploadDocument(docId: string): void {
    console.log('Downloading document:', docId);
    // Implement download functionality
    // You might want to call a service method to download the file
  }

  // Get total pages for pagination
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  // Upload Modal Methods
  openUploadModal(): void {
    this.showUploadModal = true;
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.isUploading = false;
    this.selectedUserId = '';
    this.loadUsers();
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.isUploading = false;
    this.selectedUserId = '';
    this.users = [];
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  handleFileSelection(file: File): void {
    // Check if file is PDF
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      this.uploadError = 'Please select a PDF file only.';
      return;
    }

    // Check file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'File size should not exceed 10MB.';
      return;
    }

    this.selectedFile = file;
    this.uploadError = '';
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.uploadError = '';
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file to upload.';
      return;
    }

    if (!this.selectedUserId) {
      this.uploadError = 'Please select a user to assign the document.';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(this.selectedFile);
      const base64Content = base64.split(',')[1]; // Remove data:application/pdf;base64, prefix

      // Prepare upload data
      const uploadData = {
        fileBase64: base64Content,
        fileName: this.selectedFile.name,
        status: 'FileUploaded',
        assignedToId: this.selectedUserId
      };

      // Call the upload service
      this.documentService.uploadDocument(uploadData).subscribe({
        next: (response) => {
          this.uploadSuccess = 'File uploaded successfully!';
          this.isUploading = false;
          
          // Refresh the document list
          this.loadDocuments();
          
          // Close modal after a delay
          setTimeout(() => {
            this.closeUploadModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.uploadError = error.error?.message || 'Upload failed. Please try again.';
          this.isUploading = false;
        }
      });

    } catch (error) {
      console.error('File processing error:', error);
      this.uploadError = 'Error processing file. Please try again.';
      this.isUploading = false;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Load users for assignment dropdown
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.documentService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.uploadError = 'Failed to load users. Please try again.';
        this.isLoadingUsers = false;
      }
    });
  }

  // Handle user selection
  onUserSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedUserId = target.value;
  }

  // Check user permissions based on JWT token
  checkUserPermissions(): void {
    try {
      // Check if user can upload documents (Role 1 or 2)
      this.canUpload = this.jwtService.canUploadDocuments();
      
      // Check if user can delete documents (Role 1 or 2)
      this.canDelete = this.jwtService.hasRole(['1', '2']);
      
      // Optional: Log current user info for debugging
      const currentUser = this.jwtService.getCurrentUser();
      if (currentUser) {
        console.log('Current user:', currentUser);
        console.log('Can upload:', this.canUpload);
        console.log('Can delete:', this.canDelete);
      }
      
      // Check if token is expired
      if (this.jwtService.isTokenExpired()) {
        console.warn('Token is expired, user should re-login');
        // Optionally redirect to login
        // this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error checking user permissions:', error);
      this.canUpload = false;
      this.canDelete = false;
    }
  }

  // Delete Document Methods
  confirmDelete(document: Document): void {
    this.documentToDelete = document;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.documentToDelete = null;
    this.isDeleting = false;
  }

  async deleteDocument(): Promise<void> {
    if (!this.documentToDelete) {
      return;
    }

    this.isDeleting = true;

    try {
      await this.documentService.deleteDocument(this.documentToDelete.id).toPromise();
      
      // Remove document from local arrays
      this.allDocuments = this.allDocuments.filter(doc => doc.id !== this.documentToDelete!.id);
      
      // Reapply filters to update the displayed documents
      this.applyFilters();
      
      // Close confirmation dialog
      this.cancelDelete();
      
      console.log('Document deleted successfully');
      
    } catch (error) {
      console.error('Error deleting document:', error);
      this.isDeleting = false;
      // You might want to show an error message to the user here
    }
  }

  // Document Status Update Methods
  confirmApprove(document: Document): void {
    this.documentToApprove = document;
    this.showApprovalConfirmation = true;
  }

  cancelApproval(): void {
    this.showApprovalConfirmation = false;
    this.documentToApprove = null;
    this.isUpdatingStatus = false;
  }

  async approveDocument(): Promise<void> {
    if (!this.documentToApprove) {
      return;
    }

    this.isUpdatingStatus = true;

    const updateData = {
      id: this.documentToApprove.id,
      status: 'Approved',
      comments: 'Document approved'
    };

    try {
      await this.documentService.updateDocumentStatus(updateData).toPromise();
      
      // Update document status in local arrays
      const docIndex = this.allDocuments.findIndex(doc => doc.id === this.documentToApprove!.id);
      if (docIndex !== -1) {
        this.allDocuments[docIndex].status = 'Approved';
      }
      
      // Reapply filters to update the displayed documents
      this.applyFilters();
      
      // Close confirmation dialog
      this.cancelApproval();
      
      console.log('Document approved successfully');
      
    } catch (error) {
      console.error('Error approving document:', error);
      this.isUpdatingStatus = false;
      // You might want to show an error message to the user here
    }
  }

  confirmReject(document: Document): void {
    this.documentToReject = document;
    this.rejectionComments = '';
    this.showRejectionConfirmation = true;
  }

  cancelRejection(): void {
    this.showRejectionConfirmation = false;
    this.documentToReject = null;
    this.rejectionComments = '';
    this.isUpdatingStatus = false;
  }

  async rejectDocument(): Promise<void> {
    if (!this.documentToReject || !this.rejectionComments.trim()) {
      return;
    }

    this.isUpdatingStatus = true;

    const updateData = {
      id: this.documentToReject.id,
      status: 'Rejected',
      comments: this.rejectionComments.trim()
    };

    try {
      await this.documentService.updateDocumentStatus(updateData).toPromise();
      
      // Update document status in local arrays
      const docIndex = this.allDocuments.findIndex(doc => doc.id === this.documentToReject!.id);
      if (docIndex !== -1) {
        this.allDocuments[docIndex].status = 'Rejected';
      }
      
      // Reapply filters to update the displayed documents
      this.applyFilters();
      
      // Close confirmation dialog
      this.cancelRejection();
      
      console.log('Document rejected successfully');
      
    } catch (error) {
      console.error('Error rejecting document:', error);
      this.isUpdatingStatus = false;
      // You might want to show an error message to the user here
    }
  }
}