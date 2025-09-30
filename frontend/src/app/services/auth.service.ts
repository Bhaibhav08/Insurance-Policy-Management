import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Initialize with null user
    this.currentUserSubject.next(null);
    // Check if user is already logged in
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    console.log('AuthService - Checking auth status, token exists:', !!token);
    if (token) {
      // Validate token with API
      this.apiService.getCurrentUser().subscribe({
        next: (response) => {
          console.log('AuthService - Token valid, full response:', response);
          // Handle both response structures
          const user = response.user || response;
          console.log('AuthService - Setting user from token validation:', user);
          this.currentUserSubject.next(user);
        },
        error: (error) => {
          console.log('AuthService - Token validation failed, clearing invalid token:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          this.currentUserSubject.next(null);
        }
      });
    } else {
      // No token, ensure user is null
      console.log('AuthService - No token found, setting user to null');
      this.currentUserSubject.next(null);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.login(credentials).pipe(
      tap((response: any) => {
        console.log('AuthService - Login successful, full response:', response);
        // Handle both response structures
        const user = response.user || response;
        const token = response.token;
        
        console.log('AuthService - Setting user:', user);
        console.log('AuthService - Setting token:', token);
        
        this.currentUserSubject.next(user);
        // Ensure token is stored
        if (token) {
          localStorage.setItem('token', token);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.apiService.register(userData).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('AuthService logout called');
    // Clear token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    // Clear user state
    this.currentUserSubject.next(null);
    console.log('User logged out successfully');
  }

  // Debug method to clear all auth data
  clearAllAuthData(): void {
    console.log('Clearing all authentication data');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  // Force refresh authentication state
  refreshAuthState(): void {
    console.log('AuthService - Force refreshing authentication state');
    this.checkAuthStatus();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isAgent(): boolean {
    return this.hasRole('agent');
  }

  isCustomer(): boolean {
    return this.hasRole('customer');
  }

  canAccessAdmin(): boolean {
    return this.isAdmin();
  }

  canAccessAgent(): boolean {
    return this.isAdmin() || this.isAgent();
  }

  canAccessCustomer(): boolean {
    return this.isAdmin() || this.isAgent() || this.isCustomer();
  }

  updateProfile(profileData: any): Observable<any> {
    return this.apiService.updateProfile(profileData).pipe(
      tap((response) => {
        console.log('AuthService - Profile update response:', response);
        // Handle both response structures
        const updatedUser = response.user || response;
        this.currentUserSubject.next(updatedUser);
      }),
      catchError((error) => {
        console.error('Profile update error:', error);
        return throwError(() => error);
      })
    );
  }

  uploadProfilePhoto(file: File): Observable<any> {
    return this.apiService.uploadProfilePhoto(file).pipe(
      tap((response) => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          currentUser.profilePhoto = response.profilePhoto;
          this.currentUserSubject.next(currentUser);
        }
      }),
      catchError((error) => {
        console.error('Profile photo upload error:', error);
        return throwError(() => error);
      })
    );
  }
}
