import { Component, OnInit } from '@angular/core';
import { AuditService } from '../core/services/audit.service';

@Component({
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUploadDoc: number = 0;
  totalDeletedDoc: number = 0;
  totalViewedDoc: number = 0;

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Optional: clear token
    // Redirect or further logout logic
  }

  fetchDashboardData(): void {
    this.auditService.getDashboardStats().subscribe({
      next: (data: { totaluploaddoc: number; totaldeleteddoc: number; totalvieweddoc: number; }) => {
        this.totalUploadDoc = data.totaluploaddoc;
        this.totalDeletedDoc = data.totaldeleteddoc;
        this.totalViewedDoc = data.totalvieweddoc;
      },
      error: (err: any) => {
        console.error('Error fetching dashboard data:', err);
      }
    });
  }
}
