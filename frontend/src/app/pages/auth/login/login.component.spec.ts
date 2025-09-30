import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated', 'getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate form fields', () => {
    // Test required fields
    component.loginForm.patchValue({ email: '', password: '' });
    expect(component.loginForm.invalid).toBe(true);
    expect(component.loginForm.get('email')?.errors?.['required']).toBeTruthy();
    expect(component.loginForm.get('password')?.errors?.['required']).toBeTruthy();

    // Test email format
    component.loginForm.patchValue({ email: 'invalid-email', password: 'password123' });
    expect(component.loginForm.get('email')?.errors?.['email']).toBeTruthy();

    // Test password minimum length
    component.loginForm.patchValue({ email: 'test@example.com', password: '123' });
    expect(component.loginForm.get('password')?.errors?.['minlength']).toBeTruthy();
  });

  it('should redirect if already authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '1',
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login process', () => {
    const mockResponse = {
      success: true,
      token: 'mock-token',
      user: { 
        _id: '1', 
        name: 'Test User', 
        email: 'test@example.com',
        role: 'customer' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    
    authService.login.and.returnValue(of(mockResponse));
    authService.getCurrentUser.and.returnValue(mockResponse.user);

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should handle login errors and loading state', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBe(false);

    // Test loading state
    authService.login.and.returnValue(of({ success: false, token: '', user: { _id: '', name: '', email: '', role: 'customer' as const, createdAt: new Date(), updatedAt: new Date() } }).pipe(
      delay(100)
    ));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();
    expect(component.isLoading).toBe(true);
  });

          it('should redirect based on user role', () => {
            const roles: Array<{ role: 'admin' | 'agent' | 'customer'; expectedRoute: string }> = [
              { role: 'admin', expectedRoute: '/admin-dashboard' },
              { role: 'agent', expectedRoute: '/agent-dashboard' },
              { role: 'customer', expectedRoute: '/dashboard' }
            ];

            roles.forEach(({ role, expectedRoute }) => {
              const mockUser = { 
                _id: '1', 
                name: 'Test User', 
                email: 'test@example.com',
                role,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              authService.getCurrentUser.and.returnValue(mockUser);
              component['redirectBasedOnRole']();
              expect(router.navigate).toHaveBeenCalledWith([expectedRoute]);
            });
          });

  it('should not submit invalid form', () => {
    component.loginForm.patchValue({ email: '', password: '' });
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });
});


