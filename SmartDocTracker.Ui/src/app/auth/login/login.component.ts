// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AuthService } from '../auth.service';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css'],
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, RouterModule]
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   errorMessage: string = '';
//   isLoading: boolean = false;

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService
//   ) {
//     this.loginForm = this.fb.group({
//       Email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]]
//     });
//   }

//   onSubmit() {
//     if (this.loginForm.valid) {
//       this.isLoading = true;
//       this.errorMessage = '';
      
//       const { Email, password } = this.loginForm.value;
      
//       this.authService.login(Email, password).subscribe({
//         next: (response) => {
//           this.isLoading = false;
//           console.log('Login successful', response);
//         },
//         error: (error) => {
//           this.isLoading = false;
//           this.errorMessage = error.error?.message || 'Login failed. Please check your credentials and try again.';
          
//           setTimeout(() => {
//             this.errorMessage = '';
//           }, 5000);
//         }
//       });
//     } else {
//       Object.keys(this.loginForm.controls).forEach(key => {
//         this.loginForm.get(key)?.markAsTouched();
//       });
//     }
//   }

//   getFieldError(fieldName: string): string {
//     const field = this.loginForm.get(fieldName);
//     if (field?.errors && field.touched) {
//       if (field.errors['required']) {
//         return `${fieldName === 'Email' ? 'Email' : 'Password'} is required`;
//       }
//       if (field.errors['email']) {
//         return 'Please enter a valid email address';
//       }
//       if (field.errors['minlength']) {
//         return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
//       }
//     }
//     return '';
//   }
// }


import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

 constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      emailOrUsername: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    // Disable scroll when login screen is active
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Restore scroll when user leaves login screen
    document.body.style.overflow = '';
  }

 onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { emailOrUsername, password } = this.loginForm.value;
      
      this.authService.login(emailOrUsername, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Handle successful login
          console.log('Login successful', response);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials and try again.';
          
          // Add shake animation to the form
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // onSubmit() {
  //   // Check if the form is valid
  //   if (this.loginForm.valid) {
  //     console.log('Login form submitted!', this.loginForm.value);
  //     // Here you would implement your actual login logic,
  //     // such as calling a service to authenticate the user.
  //   }
  // }

 // Helper method to get form control errors
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'Email' ? 'Email' : 'Password'} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

   // A new method to handle navigation to the signup page
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}