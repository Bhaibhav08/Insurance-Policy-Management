import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PolicyDetailComponent } from './policy-detail.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PolicyProduct } from '../../models/policy.model';
import { FormsModule } from '@angular/forms';

describe('PolicyDetailComponent', () => {
  let component: PolicyDetailComponent;
  let fixture: ComponentFixture<PolicyDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  const mockPolicy: PolicyProduct = {
    _id: '1',
    code: 'LIFE001',
    title: 'Term Life Insurance',
    description: 'Comprehensive life coverage with flexible premium options and high sum assured.',
    premium: 2500,
    termMonths: 240,
    minSumInsured: 1000000,
    maxSumInsured: 10000000,
    category: 'life',
    features: ['Death benefit', 'Accidental death benefit', 'Terminal illness benefit', 'Premium waiver'],
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getPolicyById', 'purchasePolicy', 'recordPayment']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeSpy = {
      snapshot: { paramMap: jasmine.createSpyObj('ParamMap', ['get']) }
    };

    await TestBed.configureTestingModule({
      imports: [PolicyDetailComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    // Reset all spies before each test
    apiService.getPolicyById.calls.reset();
    apiService.purchasePolicy.calls.reset();
    apiService.recordPayment.calls.reset();
    authService.getCurrentUser.calls.reset();
    
    (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.returnValue('1');
    apiService.getPolicyById.and.returnValue(of(mockPolicy));
    apiService.purchasePolicy.and.returnValue(of({ success: true }));
    apiService.recordPayment.and.returnValue(of({ success: true }));
    authService.getCurrentUser.and.returnValue({ _id: 'user1', name: 'Test User', email: 'test@example.com', role: 'customer', createdAt: new Date(), updatedAt: new Date() });
  });

  it('should create, initialize, and load policy details', () => {
    // Initial state
    expect(component).toBeTruthy();
    expect(component.policy).toBeNull();
    expect(component.isLoading).toBe(true);
    expect(component.showPurchaseForm).toBe(false);
    expect(component.purchaseForm.startDate).toBe('');
    expect(component.purchaseForm.termMonths).toBe(12);
    expect(component.purchaseForm.nominee.name).toBe('');
    expect(component.purchaseForm.nominee.relation).toBe('');
    expect(component.isPurchasing).toBe(false);
    expect(component.errorMessage).toBe('');

    // Test ngOnInit and successful policy loading
    component.ngOnInit();
    expect(activatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(component.policy).toEqual(mockPolicy);
    expect(component.isLoading).toBe(false);

    // Test policy not found (loadPolicy with non-existent ID)
    component.loadPolicy('999');
    expect(component.policy).toBeNull();
    expect(component.isLoading).toBe(false);

    // Test invalid policy ID from route
    (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);
    component.ngOnInit();
    expect(component.policy).toBeNull();
  });

  it('should handle purchase flow and authentication', () => {
    // Setup for purchase tests
    component.policy = mockPolicy;
    component.errorMessage = '';
    router.navigate.calls.reset(); // Clear previous navigations

    // Test unauthenticated user redirect
    authService.isAuthenticated.and.returnValue(false);
    component.onPurchaseClick();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.showPurchaseForm).toBe(false);

    // Test authenticated user purchase form display
    authService.isAuthenticated.and.returnValue(true);
    component.onPurchaseClick();
    expect(component.showPurchaseForm).toBe(true);

    // Test successful purchase submission
    component.purchaseForm = {
      startDate: '2025-01-01',
      termMonths: 12,
      nominee: { name: 'John Doe', relation: 'spouse' }
    };
    spyOn(window, 'alert');
    component.onPurchaseSubmit();
    expect(apiService.purchasePolicy).toHaveBeenCalledWith('1', {
      startDate: '2025-01-01',
      termMonths: 12,
      nominee: { name: 'John Doe', relation: 'spouse' }
    });
    expect(component.isPurchasing).toBe(false);
    expect(component.showPurchaseForm).toBe(false);
    expect(window.alert).toHaveBeenCalledWith('Policy purchased successfully! Redirecting to payment...');

    // Test purchase error
    apiService.purchasePolicy.and.returnValue(throwError(() => ({ error: { message: 'Payment failed' } })));
    component.onPurchaseSubmit();
    expect(component.isPurchasing).toBe(false);
    expect(component.errorMessage).toBe('Payment failed');

    // Test purchase without policy selected
    apiService.purchasePolicy.calls.reset(); // Reset spy calls
    component.policy = null;
    component.onPurchaseSubmit();
    expect(apiService.purchasePolicy).not.toHaveBeenCalled();
  });

  it('should provide correct utility functions for display', () => {
    // Test currency formatting
    expect(component.formatCurrency(2500)).toContain('₹2,500');
    expect(component.formatCurrency(1234567)).toContain('₹12,34,567'); // Indian number format

    // Test category icon
    expect(component.getCategoryIcon('life')).toBe('👨‍👩‍👧‍👦');
    expect(component.getCategoryIcon('health')).toBe('🏥');
    expect(component.getCategoryIcon('auto')).toBe('🚗');
    expect(component.getCategoryIcon('home')).toBe('🏠');
    expect(component.getCategoryIcon('travel')).toBe('✈️');
    expect(component.getCategoryIcon('unknown')).toBe('🛡️');
  });
});