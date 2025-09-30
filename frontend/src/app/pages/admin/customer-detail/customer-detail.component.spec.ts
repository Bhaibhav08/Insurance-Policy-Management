import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomerDetailComponent } from './customer-detail.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

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
      statistics: {
        totalPolicies: 2,
        totalClaims: 2,
        pendingClaims: 1,
        totalPremium: 10000
      }
    }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getCustomerDetailsForAdmin']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue('customer1') } }
    });

    await TestBed.configureTestingModule({
      imports: [CustomerDetailComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    authService.getCurrentUser.and.returnValue({ 
      _id: 'admin1', 
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    apiService.getCustomerDetailsForAdmin.and.returnValue(of(mockCustomerDetails));
  });

  it('should create, initialize, and load customer details', () => {
    expect(component).toBeTruthy();
    expect(component.customer).toBeNull();
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual({});
    expect(component.isLoading).toBe(true);
    expect(component.customerId).toBe('');
    expect(component.activeTab).toBe('overview');

    component.ngOnInit();
    expect(component.customerId).toBe('customer1');
    expect(apiService.getCustomerDetailsForAdmin).toHaveBeenCalledWith('customer1');

    // Test successful loading
    component.loadCustomerDetails();
    expect(component.customer).toEqual(mockCustomerDetails.data.customer);
    expect(component.policies).toEqual(mockCustomerDetails.data.policies);
    expect(component.claims).toEqual(mockCustomerDetails.data.claims);
    expect(component.statistics).toEqual(mockCustomerDetails.data.statistics);
    expect(component.isLoading).toBe(false);

    // Test error handling
    const errorResponse = { error: { message: 'Customer not found' } };
    apiService.getCustomerDetailsForAdmin.and.returnValue(throwError(() => errorResponse));
    component.customer = null; // Reset customer
    component.policies = []; // Reset policies
    component.claims = []; // Reset claims
    component.statistics = {}; // Reset statistics
    component.loadCustomerDetails();
    expect(component.customer).toBeNull();
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual({});
    expect(component.isLoading).toBe(false);

    // Test API response with success: false
    const failedResponse = { success: false, data: null };
    apiService.getCustomerDetailsForAdmin.and.returnValue(of(failedResponse));
    component.customer = null; // Reset customer
    component.loadCustomerDetails();
    expect(component.customer).toBeNull();
  });

  it('should handle utility functions and data formatting', () => {
    // Test currency formatting
    const formatted = component.formatCurrency(10000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('10,000');

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
    expect(component.getStatusColor('verified')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('pending')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('rejected')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('UNKNOWN')).toBe('text-gray-600 bg-gray-100');

    // Test gender label formatting
    expect(component.getGenderLabel('male')).toBe('Male');
    expect(component.getGenderLabel('female')).toBe('Female');
    expect(component.getGenderLabel('other')).toBe('Other');
    expect(component.getGenderLabel('prefer_not_to_say')).toBe('Prefer not to say');
    expect(component.getGenderLabel('unknown')).toBe('unknown');
  });

  it('should handle different data scenarios and tab switching', () => {
    // Test tab switching
    component.setActiveTab('policies');
    expect(component.activeTab).toBe('policies');

    component.setActiveTab('claims');
    expect(component.activeTab).toBe('claims');

    component.setActiveTab('overview');
    expect(component.activeTab).toBe('overview');

    // Test with empty data
    const emptyResponse = {
      success: true,
      data: {
        customer: null,
        policies: [],
        claims: [],
        statistics: null
      }
    };
    apiService.getCustomerDetailsForAdmin.and.returnValue(of(emptyResponse));
    component.loadCustomerDetails();
    expect(component.customer).toBeNull();
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual({});

    // Test with partial data
    const partialResponse = {
      success: true,
      data: {
        customer: mockCustomerDetails.data.customer,
        policies: [],
        claims: [],
        statistics: {
          totalPolicies: 0,
          totalClaims: 0,
          pendingClaims: 0,
          totalPremium: 0
        }
      }
    };
    apiService.getCustomerDetailsForAdmin.and.returnValue(of(partialResponse));
    component.loadCustomerDetails();
    expect(component.customer).toEqual(mockCustomerDetails.data.customer);
    expect(component.policies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual(partialResponse.data.statistics);
  });
});