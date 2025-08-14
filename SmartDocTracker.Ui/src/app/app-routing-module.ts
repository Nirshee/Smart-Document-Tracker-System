// // app-routing-module.ts
// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';

// // app-routing.module.ts
// const routes: Routes = [
//   { 
//     path: '', 
//     loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) 
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }

// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/login/auth.guard';

const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
       {
    path: 'documents',
    loadComponent: () => import('./documents/document-list.component').then(m => m.DocumentListComponent),
  },
       {
    path: 'user',
    loadComponent: () => import('./users/user-list.component').then(m => m.UserListComponent),
    canActivate: [AuthGuard]
  },
       {
    path: 'audit',
    loadComponent: () => import('./audit/audit.component').then(m => m.AuditComponent),
    canActivate: [AuthGuard]
  },
//  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    
    ]
  },
  { path: '**', redirectTo: 'login' } // Redirect all unknown paths to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }