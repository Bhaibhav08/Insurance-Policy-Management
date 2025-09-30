import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'isAuthenticated']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['getCustomerDashboard', 'getUserPolicies', 'getClaims', 'getPayments']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        provideRouter([
          { path: 'policies', component: {} as any },
          { path: 'claims', component: {} as any },
          { path: 'payments', component: {} as any },
          { path: 'my-policies', component: {} as any },
          { path: 'profile', component: {} as any },
          { path: 'dashboard', component: {} as any },
          { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
  const mockUser = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };
    
    authService.getCurrentUser.and.returnValue(mockUser);
    authService.isAuthenticated.and.returnValue(true);
    
    const mockDashboardData = {
      stats: {
        totalPolicies: 3,
        activePolicies: 2,
        pendingClaims: 1,
        totalPayments: 15000
      }
    };
    
    apiService.getCustomerDashboard.and.returnValue(of(mockDashboardData));
    apiService.getUserPolicies.and.returnValue(of([]));
    apiService.getClaims.and.returnValue(of([]));
    apiService.getPayments.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading).toBe(true);
  });

  it('should load dashboard data and set user on init', () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    authService.getCurrentUser.and.returnValue(mockUser);
    component.ngOnInit();
    
    expect(apiService.getCustomerDashboard).toHaveBeenCalled();
    expect(component.currentUser).toEqual(mockUser);
    expect(component.isLoading).toBe(false);
  });

  it('should update stats from dashboard data', () => {
    const mockDashboardData = {
      data: {
        stats: {
          totalPolicies: 5,
          activePolicies: 4,
          totalClaims: 2,
          pendingClaims: 2,
          totalPayments: 25000,
          nextPaymentDue: null
        }
      }
    };
    
    apiService.getCustomerDashboard.and.returnValue(of(mockDashboardData));
    component.ngOnInit();
    
    expect(component.stats.totalPolicies).toBe(5);
    expect(component.stats.activePolicies).toBe(4);
    expect(component.stats.totalClaims).toBe(2);
    expect(component.stats.pendingClaims).toBe(2);
    expect(component.stats.totalPayments).toBe(25000);
  });

  it('should format currency and date correctly', () => {
    const formatted = component.formatCurrency(15000);
    expect(formatted).toContain('₹15,000');
    
    const date = new Date('2025-01-01');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toContain('Jan');
    expect(formattedDate).toContain('2025');
  });

  it('should navigate to different pages', () => {
    component.viewAllPolicies();
    expect(router.navigate).toHaveBeenCalledWith(['/policies']);
    
    component.viewAllClaims();
    expect(router.navigate).toHaveBeenCalledWith(['/claims']);
    
    component.viewAllPayments();
    expect(router.navigate).toHaveBeenCalledWith(['/payments']);
    
    component.viewProfile();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should handle user greeting and API errors', () => {
    component.currentUser = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    expect(component.currentUser?.name).toBe('John Doe');
    expect(component.getGreeting()).toContain('Good');
    
    // Test API error handling
    apiService.getCustomerDashboard.and.returnValue(of({}));
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
  });
});


