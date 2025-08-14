import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Add this for *ngIf
import { ReactiveFormsModule } from '@angular/forms'; // For formGroup

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './auth/login/login.component'; // Adjust path as needed
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    CommonModule, // Add this
    ReactiveFormsModule, // Add this
    HttpClientModule,
    AppRoutingModule,
    LoginComponent,
    SidebarComponent,
    PdfViewerModule
  ],
  providers: [],

  bootstrap: [App]
})
export class AppModule { }


// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { CommonModule } from '@angular/common'; // Add this for *ngIf
// import { ReactiveFormsModule } from '@angular/forms'; // For formGroup
// import { HttpClientModule } from '@angular/common/http'; // For HTTP requests

// import { AppRoutingModule } from './app-routing-module';
// import { App } from './app';
// import { LoginComponent } from './auth/login/login.component'; // Adjust path as needed
// // import { SidebarComponent } from './core/sidebar/sidebar.component';
// // import { NavbarComponent } from './core/navbar/navbar.component';

// @NgModule({
//   declarations: [
//     App
//   ],
//   imports: [
//     BrowserModule,
//     CommonModule, // Add this
//     ReactiveFormsModule, // Add this
//     HttpClientModule,
//     AppRoutingModule,
//     LoginComponent,
//     // SidebarComponent,
//     // NavbarComponent
//     ],
//   providers: [],
//   bootstrap: [App]
// })
// export class AppModule { 
//  isSidebarCollapsed = false;

//   toggleSidebar() {
//     this.isSidebarCollapsed = !this.isSidebarCollapsed;
//   }

// }