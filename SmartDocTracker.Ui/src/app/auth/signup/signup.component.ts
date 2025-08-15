import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class SignupComponent {
  signupForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmedPassword: new FormControl('', [Validators.required]),
      termsAccepted: new FormControl(false, [Validators.requiredTrue]),
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmedPassword = form.get('confirmedPassword')?.value;
    return password === confirmedPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const { username, email, password } = this.signupForm.value;

      this.authService.signUp(username, email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'User registered successfully!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'User creation failed. Please try again.';
          setTimeout(() => (this.errorMessage = ''), 5000);
        }
      });
    } else {
      this.signupForm.markAllAsTouched(); // show validation errors
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
