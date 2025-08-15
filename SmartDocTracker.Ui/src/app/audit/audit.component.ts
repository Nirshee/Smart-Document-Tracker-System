import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JwtService } from '../core/services/jwt.service';
import { AuditDetail, AuditService } from '../core/services/audit.service';
import * as XLSX from 'xlsx';

import FileSaver from 'file-saver';
import saveAs from 'file-saver';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgxPaginationModule]
})
export class AuditComponent implements OnInit {
  Audit: AuditDetail[] = [];
  isLoading = false;
  
    // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  constructor(
    private auditservice: AuditService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Load all users
  loadUsers(): void {
    this.isLoading = true;
    this.auditservice.getAllUsers().subscribe({
      next: (Audit) => {
        this.totalItems = Audit.length;
        this.Audit = Audit;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

exportToExcel(): void {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.Audit);

  const colCount = Object.keys(this.Audit[0] || {}).length;
  worksheet['!cols'] = new Array(colCount).fill({ wch: 30 });

  const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell_address]) continue;

      worksheet[cell_address].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  }

  const workbook: XLSX.WorkBook = {
    Sheets: { 'Audit Data': worksheet },
    SheetNames: ['Audit Data']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true 
  });

  const data: Blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(data, 'AuditData.xlsx');
}

}