# SmartDocTracker Backend

A comprehensive document management system built with ASP.NET Core Web API featuring JWT authentication, role-based access control, and document tracking capabilities.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Reviewer, Viewer)
  - Secure password hashing with BCrypt

- **Document Management**
  - Upload documents with automatic PDF conversion
  - Document status tracking (Pending, Approved, Rejected, Converted)
  - Document versioning
  - File encryption support
  - Document assignment to users

- **Audit Logging**
  - Comprehensive audit trail for all document activities
  - User action tracking
  - Timestamp-based logging

- **Dashboard & Analytics**
  - Document statistics
  - User activity monitoring
  - Status-based document filtering

## Technology Stack
- **FrontendFramework:** Angular, Bootstrap
- **Framework:** ASP.NET Core 8.0
- **Database:** SQL Server with Entity Framework Core
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** BCrypt.NET
- **File Conversion:** LibreOffice (for PDF conversion)
- **Architecture:** Repository Pattern with Minimal APIs

## Project Structure
SmartDocTracker.Backend/
├── Controllers/          # API Controllers (legacy)
├── Endpoints/           # Minimal API Endpoints
├── DTOs/               # Data Transfer Objects
├── Models/             # Entity Models
├── Repositories/       # Repository Pattern Implementation
├── Services/           # Business Logic Services
├── Properties/         # Project Properties
└── Uploads/            # File Upload Directory

SmartDocTracker.UI/
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── api.service.ts
│   │       ├── auth.service.ts
│   │       ├── document.service.ts
│   │       ├── lookup.service.ts
│   │       └── audit.service.ts
│   ├── shared/
│   │   └── components/
│   │       └── file-upload.component.ts
│   ├── auth/
│   │   └── login.component.ts
│   ├── documents/
│   │   ├── document-list.component.ts
│   │   └── upload.component.ts
│   ├── audit/
│   │   └── audit-log.component.ts
│   └── app-routing.module.ts
