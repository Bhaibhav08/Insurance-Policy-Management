import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PoliciesComponent } from './policies.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PolicyProduct } from '../../models/policy.model';

describe('PoliciesComponent', () => {
  let component: PoliciesComponent;
  let fixture: ComponentFixture<PoliciesComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockPolicies: PolicyProduct[] = [
    {
      _id: '1',
      code: 'LIFE001',
      title: 'Term Life Insurance',
      description: 'Comprehensive life coverage',
      premium: 2500,
      termMonths: 240,
      minSumInsured: 1000000,
      maxSumInsured: 10000000,
      category: 'life',
      features: ['Death benefit', 'Accidental death benefit'],
      createdAt: new Date(),
      imageUrl: 'https://example.com/image1.jpg'
    },
    {
      _id: '2',
      code: 'HEALTH001',
      title: 'Family Health Insurance',
      description: 'Complete health coverage',
      premium: 1800,
      termMonths: 12,
      minSumInsured: 500000,
      maxSumInsured: 5000000,
      category: 'health',
      features: ['Cashless treatment', 'Pre & post hospitalization'],
      createdAt: new Date(),
      imageUrl: 'https://example.com/image2.jpg'
    }
  ];

  const mockPurchaseResponse = {
    success: true,
    data: { _id: 'policy1', status: 'ACTIVE' }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getPolicies', 'purchasePolicy']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });

    await TestBed.configureTestingModule({
      imports: [PoliciesComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PoliciesComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    apiService.getPolicies.and.returnValue(of(mockPolicies));
    apiService.purchasePolicy.and.returnValue(of(mockPurchaseResponse));
    authService.getCurrentUser.and.returnValue({ 
      _id: 'user1', 
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it('should create, initialize, and load policies', () => {
    expect(component).toBeTruthy();
    expect(component.policies).toEqual([]);
    expect(component.displayedPolicies).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.searchTerm).toBe('');
    expect(component.currentUser).toBeNull();
    expect(component.showPurchaseModal).toBe(false);
    expect(component.selectedPolicy).toBeNull();
    expect(component.paymentStep).toBe('form');

    component.ngOnInit();
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(apiService.getPolicies).toHaveBeenCalled();

    // Test successful loading
    component.loadPolicies();
    expect(component.policies).toEqual(mockPolicies);
    expect(component.displayedPolicies).toEqual(mockPolicies);
    expect(component.isLoading).toBe(false);

    // Test API failure with fallback data
    apiService.getPolicies.and.returnValue(throwError(() => new Error('API Error')));
    component.loadPolicies();
    expect(component.policies.length).toBeGreaterThan(0);
    expect(component.displayedPolicies.length).toBeGreaterThan(0);
    expect(component.isLoading).toBe(false);

    // Test empty API response
    apiService.getPolicies.and.returnValue(of([]));
    component.loadPolicies();
    expect(component.policies).toEqual([]);
    expect(component.displayedPolicies).toEqual([]);

    // Test wrapped API response
    const wrappedResponse = { data: mockPolicies };
    apiService.getPolicies.and.returnValue(of(wrappedResponse));
    component.loadPolicies();
    expect(component.policies).toEqual(mockPolicies);
  });

  it('should handle filtering, search, and purchase modal operations', () => {
    component.policies = mockPolicies;
    
    // Test search by title
    component.searchTerm = 'life';
    component.onSearch();
    expect(component.displayedPolicies.length).toBe(1);
    expect(component.displayedPolicies[0].title).toContain('Life');

    // Test search by category
    component.searchTerm = 'health';
    component.onSearch();
    expect(component.displayedPolicies.length).toBe(1);
    expect(component.displayedPolicies[0].category).toBe('health');

    const policy = mockPolicies[0];
    
    // Test opening modal
    component.openPurchaseModal(policy);
    expect(component.selectedPolicy).toBe(policy);
    expect(component.showPurchaseModal).toBe(true);
    expect(component.purchaseData.startDate).toBeDefined();
    expect(component.purchaseData.termMonths).toBe(policy.termMonths);
    expect(component.paymentStep).toBe('form');

    // Test closing modal
    component.paymentStep = 'confirmation';
    component.closePurchaseModal();
    expect(component.showPurchaseModal).toBe(false);
    expect(component.selectedPolicy).toBeNull();
    expect(component.paymentStep).toBe('form');
  });

  it('should handle payment validation, processing, and utility functions', () => {
    // Test valid payment data
    component.purchaseData = {
      startDate: '2025-01-01',
      termMonths: 12,
      nominee: { name: 'John Doe', relation: 'spouse' },
      paymentMethod: 'credit_card'
    };
    component.proceedToPayment();
    expect(component.paymentStep).toBe('confirmation');
    expect(component.paymentError).toBe('');

    // Test invalid payment data
    component.purchaseData = {
      startDate: '',
      termMonths: 12,
      nominee: { name: '', relation: '' },
      paymentMethod: 'credit_card'
    };
    component.proceedToPayment();
    expect(component.paymentStep).toBe('form');
    expect(component.paymentError).toBe('Please fill in all required fields');

    // Test successful purchase
    component.selectedPolicy = mockPolicies[0];
    component.currentUser = { _id: 'user1' };
    component.purchaseData = {
      startDate: '2025-01-01',
      termMonths: 12,
      nominee: { name: 'John Doe', relation: 'spouse' },
      paymentMethod: 'credit_card'
    };

    spyOn(component, 'closePurchaseModal');
    component.purchasePolicy();
    expect(component.paymentStep).toBe('success');

    // Test purchase error
    const errorResponse = { error: { message: 'Purchase failed' } };
    apiService.purchasePolicy.and.returnValue(throwError(() => errorResponse));
    component.purchasePolicy();
    expect(component.paymentError).toBe('Purchase failed');
    expect(component.paymentStep).toBe('error');

    // Test confirmation with async behavior
    apiService.purchasePolicy.and.returnValue(of(mockPurchaseResponse).pipe(delay(100)));
    component.confirmPayment();
    expect(component.paymentStep).toBe('processing');
    fixture.detectChanges();
    expect(apiService.purchasePolicy).toHaveBeenCalled();

    // Test payment navigation
    component.paymentStep = 'error';
    component.retryPayment();
    expect(component.paymentStep).toBe('form');
    expect(component.paymentError).toBe('');

    component.paymentStep = 'confirmation';
    component.backToEdit();
    expect(component.paymentStep).toBe('form');
    expect(component.paymentError).toBe('');

    // Test utility functions
    expect(component.getCategoryIcon('life')).toBe('👨‍👩‍👧‍👦');
    expect(component.getCategoryIcon('health')).toBe('🏥');
    expect(component.getCategoryIcon('auto')).toBe('🚗');
    expect(component.getCategoryIcon('home')).toBe('🏠');
    expect(component.getCategoryIcon('travel')).toBe('✈️');
    expect(component.getCategoryIcon('unknown')).toBe('🛡️');

    expect(component.getCategoryColor('life')).toBe('bg-blue-500');
    expect(component.getCategoryColor('health')).toBe('bg-green-500');
    expect(component.getCategoryColor('auto')).toBe('bg-red-500');
    expect(component.getCategoryColor('home')).toBe('bg-purple-500');
    expect(component.getCategoryColor('travel')).toBe('bg-yellow-500');
    expect(component.getCategoryColor('unknown')).toBe('bg-gray-500');

    expect(component.getCategoryGradient('life')).toBe('from-blue-500 to-blue-600');
    expect(component.getCategoryGradient('health')).toBe('from-green-500 to-green-600');
    expect(component.getCategoryGradient('auto')).toBe('from-red-500 to-red-600');
    expect(component.getCategoryGradient('home')).toBe('from-purple-500 to-purple-600');
    expect(component.getCategoryGradient('travel')).toBe('from-yellow-500 to-yellow-600');
    expect(component.getCategoryGradient('unknown')).toBe('from-gray-500 to-gray-600');

    const formatted = component.formatCurrency(2500);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('2,500');

    expect(component.getPremiumFrequency(12000, 12)).toBe('₹12,000/year');
    expect(component.getPremiumFrequency(12000, 24)).toBe('₹1,000/month');
  });
});