import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['customer', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { confirmPassword, agreeToTerms, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Please login to continue.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'admin':
          this.router.navigate(['/admin-dashboard']);
          break;
        case 'agent':
          this.router.navigate(['/agent-dashboard']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    }
  }
}
