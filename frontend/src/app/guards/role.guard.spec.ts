import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for admin role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = guard.canActivate({ data: { roles: ['admin'] } } as any);
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access for agent role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '2',
      name: 'Agent User',
      email: 'agent@example.com',
      role: 'agent',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = guard.canActivate({ data: { roles: ['agent'] } } as any);
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access for customer role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '3',
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = guard.canActivate({ data: { roles: ['customer'] } } as any);
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when user role is not in allowed roles', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '3',
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = guard.canActivate({ data: { roles: ['admin', 'agent'] } } as any);
    
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should deny access when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    
    const result = guard.canActivate({ data: { roles: ['admin'] } } as any);
    
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny access when no roles are specified', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = guard.canActivate({ data: {} } as any);
    
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should allow access when user has multiple roles and one matches', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({ 
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = guard.canActivate({ data: { roles: ['admin', 'agent'] } } as any);
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});


