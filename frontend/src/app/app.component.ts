import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'InsureGuard - Insurance Management System';
  currentUser: User | null = null;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('App component - current user updated:', user);
      console.log('App component - isAuthenticated:', this.authService.isAuthenticated());
    });
    
    // Also check initial state
    console.log('App component - Initial auth state:', {
      currentUser: this.currentUser,
      isAuthenticated: this.authService.isAuthenticated(),
      hasToken: !!localStorage.getItem('token')
    });
  }

  logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    // Navigate to home page
    this.router.navigate(['/home']);
  }

  // Debug method to refresh auth state
  refreshAuthState(): void {
    console.log('App component - Refreshing auth state');
    this.authService.refreshAuthState();
  }
}