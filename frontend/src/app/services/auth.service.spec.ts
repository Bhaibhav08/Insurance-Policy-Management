import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token', () => {
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          _id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      service.login({ email: 'test@example.com', password: 'password123' }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(service.getCurrentUser()).toEqual(mockResponse.user);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' });
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const errorResponse = { message: 'Invalid credentials' };

      service.login({ email: 'test@example.com', password: 'wrongpassword' }).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error).toEqual(errorResponse);
        }
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/auth/login');
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('register', () => {
    it('should register successfully', () => {
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          _id: '1',
          name: 'New User',
          email: 'new@example.com',
          role: 'customer'
        }
      };

      service.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'customer'
      }).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('authentication state', () => {
    it('should handle user authentication state', () => {
      // Test unauthenticated state
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();

      // Test authenticated state
      const mockUser = {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (service as any).currentUserSubject.next(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear token and user data', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify({ name: 'Test User' }));
      
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});


