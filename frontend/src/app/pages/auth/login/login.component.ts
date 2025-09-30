import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          this.redirectBasedOnRole();
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
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
