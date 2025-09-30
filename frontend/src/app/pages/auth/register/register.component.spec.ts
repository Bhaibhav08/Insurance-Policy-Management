import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated', 'getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create, initialize form, and handle validation', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.registerForm.get('role')?.value).toBe('customer');
    expect(component.registerForm.get('agreeToTerms')?.value).toBe(false);
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');

    // Test required field validation
    component.registerForm.patchValue({ name: '', email: '', password: '', confirmPassword: '' });
    expect(component.registerForm.invalid).toBe(true);
    expect(component.registerForm.get('name')?.errors?.['required']).toBeTruthy();
    expect(component.registerForm.get('email')?.errors?.['required']).toBeTruthy();
    expect(component.registerForm.get('password')?.errors?.['required']).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')?.errors?.['required']).toBeTruthy();

    // Test email format validation
    component.registerForm.patchValue({ email: 'invalid-email' });
    expect(component.registerForm.get('email')?.errors?.['email']).toBeTruthy();

    component.registerForm.patchValue({ email: 'valid@example.com' });
    expect(component.registerForm.get('email')?.errors?.['email']).toBeFalsy();

    // Test password minimum length validation
    component.registerForm.patchValue({ password: '123' });
    expect(component.registerForm.get('password')?.errors?.['minlength']).toBeTruthy();

    component.registerForm.patchValue({ password: 'password123' });
    expect(component.registerForm.get('password')?.errors?.['minlength']).toBeFalsy();

    // Test password confirmation validation
    component.registerForm.patchValue({ 
      password: 'password123', 
      confirmPassword: 'different123' 
    });
    expect(component.registerForm.errors?.['passwordMismatch']).toBeTruthy();

    component.registerForm.patchValue({ 
      password: 'password123', 
      confirmPassword: 'password123' 
    });
    expect(component.registerForm.errors?.['passwordMismatch']).toBeFalsy();

    // Test role validation
    component.registerForm.patchValue({ role: 'agent' });
    expect(component.registerForm.get('role')?.value).toBe('agent');

    component.registerForm.patchValue({ role: 'customer' });
    expect(component.registerForm.get('role')?.value).toBe('customer');

    // Test terms agreement validation
    component.registerForm.patchValue({ agreeToTerms: false });
    expect(component.registerForm.get('agreeToTerms')?.errors?.['required']).toBeTruthy();

    component.registerForm.patchValue({ agreeToTerms: true });
    expect(component.registerForm.get('agreeToTerms')?.errors?.['required']).toBeFalsy();
  });

  it('should handle registration process and authentication', () => {
    // Test redirect if already authenticated
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '1',
      name: 'Existing User',
      email: 'existing@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

    // Reset for registration test
    authService.isAuthenticated.and.returnValue(false);
    component.ngOnInit();

    const mockResponse = {
      success: true,
      token: 'mock-token',
      user: { 
        _id: '1', 
        name: 'New User', 
        email: 'new@example.com',
        role: 'customer' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    
    authService.register.and.returnValue(of(mockResponse));
    authService.getCurrentUser.and.returnValue(mockResponse.user);

    component.registerForm.patchValue({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'customer',
      agreeToTerms: true
    });

    component.onSubmit();
    expect(authService.register).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: 'customer'
    });

    // Test registration error
    const errorResponse = { error: { message: 'Email already exists' } };
    authService.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.patchValue({
      name: 'New User',
      email: 'existing@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'customer',
      agreeToTerms: true
    });

    component.onSubmit();
    expect(component.errorMessage).toBe('Email already exists');
    expect(component.isLoading).toBe(false);

    // Test loading state
    authService.register.and.returnValue(of({ success: false, token: '', user: { _id: '', name: '', email: '', role: 'customer' as const, createdAt: new Date(), updatedAt: new Date() } }).pipe(
      delay(100)
    ));

    component.registerForm.patchValue({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'customer',
      agreeToTerms: true
    });

    component.onSubmit();
    expect(component.isLoading).toBe(true);
  });

  it('should handle form submission validation and role-based redirection', () => {
    // Test invalid form submission
    component.registerForm.patchValue({ 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      agreeToTerms: false
    });
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();

    // Test password mismatch
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different123',
      role: 'customer',
      agreeToTerms: true
    });
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();

    // Test role-based redirection
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
});