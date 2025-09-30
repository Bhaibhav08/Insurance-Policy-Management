import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomerProfileComponent } from './customer-profile.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

describe('CustomerProfileComponent', () => {
  let component: CustomerProfileComponent;
  let fixture: ComponentFixture<CustomerProfileComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let getSpy: jasmine.Spy;

  const mockCustomerDetails = {
    success: true,
    data: {
      customer: {
        _id: 'customer1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
        status: 'ACTIVE',
        gender: 'male',
        maritalStatus: 'married',
        createdAt: new Date('2025-01-01')
      },
      policies: [
        { _id: 'policy1', title: 'Health Insurance', status: 'ACTIVE' },
        { _id: 'policy2', title: 'Life Insurance', status: 'ACTIVE' }
      ],
      claims: [
        { _id: 'claim1', status: 'PENDING', amountClaimed: 10000 },
        { _id: 'claim2', status: 'APPROVED', amountClaimed: 5000 }
      ],
      messages: [
        { _id: 'msg1', content: 'Hello', timestamp: new Date() },
        { _id: 'msg2', content: 'How can I help?', timestamp: new Date() }
      ],
      statistics: {
        totalPolicies: 2,
        totalClaims: 2,
        pendingClaims: 1,
        totalPremium: 10000
      }
    }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getCustomerDetails']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    getSpy = jasmine.createSpy('get').and.returnValue('customer1');
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: {
          get: getSpy
        }
      }
    });

    await TestBed.configureTestingModule({
      imports: [CustomerProfileComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerProfileComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    apiService.getCustomerDetails.and.returnValue(of(mockCustomerDetails));
  });

  it('should create and initialize with default values', () => {
    expect(component).toBeTruthy();
    expect(component.customerId).toBe('');
    expect(component.customer).toBeNull();
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.messages).toEqual([]);
    expect(component.statistics).toEqual({});
    expect(component.isLoading).toBe(true);
    expect(component.activeTab).toBe('profile');
  });

  it('should load customer details and handle API responses', () => {
    // Test successful loading
    component.ngOnInit();
    expect(component.customerId).toBe('customer1');
    expect(apiService.getCustomerDetails).toHaveBeenCalledWith('customer1');

    component.loadCustomerDetails();
    expect(component.customer).toEqual(mockCustomerDetails.data.customer);
    expect(component.policies).toEqual(mockCustomerDetails.data.policies);
    expect(component.claims).toEqual(mockCustomerDetails.data.claims);
    expect(component.messages).toEqual(mockCustomerDetails.data.messages);
    expect(component.statistics).toEqual(mockCustomerDetails.data.statistics);
    expect(component.isLoading).toBe(false);

    // Test API error
    apiService.getCustomerDetails.and.returnValue(throwError(() => new Error('API Error')));
    component.loadCustomerDetails();
    expect(component.isLoading).toBe(false);
  });

  it('should handle tab switching and utility functions', () => {
    // Test tab switching
    component.setActiveTab('policies');
    expect(component.activeTab).toBe('policies');

    // Test currency formatting
    const formatted = component.formatCurrency(5000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('5,000');

    // Test date formatting
    const date = new Date('2025-01-01');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toContain('Jan');
    expect(formattedDate).toContain('2025');

    // Test status colors
    expect(component.getStatusColor('ACTIVE')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('PENDING')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('CANCELLED')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('EXPIRED')).toBe('text-gray-600 bg-gray-100');
    expect(component.getStatusColor('APPROVED')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('REJECTED')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('UNKNOWN')).toBe('text-gray-600 bg-gray-100');

    // Test relationship labels
    expect(component.getRelationshipLabel('spouse')).toBe('Spouse');
    expect(component.getRelationshipLabel('child')).toBe('Child');
    expect(component.getRelationshipLabel('parent')).toBe('Parent');
    expect(component.getRelationshipLabel('sibling')).toBe('Sibling');
    expect(component.getRelationshipLabel('other')).toBe('Other');
    expect(component.getRelationshipLabel('unknown')).toBe('unknown');

    // Test gender labels
    expect(component.getGenderLabel('male')).toBe('Male');
    expect(component.getGenderLabel('female')).toBe('Female');
    expect(component.getGenderLabel('other')).toBe('Other');
    expect(component.getGenderLabel('prefer_not_to_say')).toBe('Prefer not to say');
    expect(component.getGenderLabel('unknown')).toBe('unknown');

    // Test marital status labels
    expect(component.getMaritalStatusLabel('single')).toBe('Single');
    expect(component.getMaritalStatusLabel('married')).toBe('Married');
    expect(component.getMaritalStatusLabel('divorced')).toBe('Divorced');
    expect(component.getMaritalStatusLabel('widowed')).toBe('Widowed');
    expect(component.getMaritalStatusLabel('separated')).toBe('Separated');
    expect(component.getMaritalStatusLabel('unknown')).toBe('unknown');
  });

  it('should handle edge cases and various scenarios', () => {
    // Test empty customer ID
    getSpy.and.returnValue(null);
    component.ngOnInit();
    expect(component.customerId).toBe('');
    expect(apiService.getCustomerDetails).not.toHaveBeenCalled();

    // Test response without data
    const emptyResponse = { success: true, data: null };
    apiService.getCustomerDetails.and.returnValue(of(emptyResponse));
    component.loadCustomerDetails();
    expect(component.customer).toBeNull();
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.messages).toEqual([]);
    expect(component.statistics).toEqual({});

    // Test response with success false
    const failedResponse = { success: false, data: mockCustomerDetails.data };
    apiService.getCustomerDetails.and.returnValue(of(failedResponse));
    component.loadCustomerDetails();
    expect(component.customer).toBeNull();
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.messages).toEqual([]);
    expect(component.statistics).toEqual({});

    // Test different tab selections
    const tabs = ['profile', 'policies', 'claims', 'messages', 'statistics'];
    tabs.forEach(tab => {
      component.setActiveTab(tab);
      expect(component.activeTab).toBe(tab);
    });

    // Test different date formats
    const dates = [
      new Date('2025-01-01'),
      new Date('2025-12-31'),
      '2025-01-01',
      '2025-12-31T10:30:00Z'
    ];
    dates.forEach(date => {
      const formatted = component.formatDate(date);
      expect(formatted).toContain('2025');
    });

    // Test different currency amounts
    const amounts = [0, 100, 1000, 10000, 100000, 1000000];
    amounts.forEach(amount => {
      const formatted = component.formatCurrency(amount);
      expect(formatted).toContain('₹');
    });
  });
});

