import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MyPoliciesComponent } from './my-policies.component';
import { ApiService } from '../../services/api.service';
import { UserPolicy } from '../../models/policy.model';

describe('MyPoliciesComponent', () => {
  let component: MyPoliciesComponent;
  let fixture: ComponentFixture<MyPoliciesComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockPolicies: UserPolicy[] = [
    {
      _id: '1',
      userId: 'user1',
      policyProductId: 'product1',
      status: 'ACTIVE',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
      premiumPaid: 5000,
      nominee: { name: 'John Doe', relation: 'spouse' },
      createdAt: new Date(),
      policyProduct: {
        _id: 'product1',
        title: 'Health Insurance',
        code: 'HI001',
        description: 'Comprehensive health coverage',
        premium: 5000,
        termMonths: 12,
        minSumInsured: 100000,
        maxSumInsured: 1000000,
        category: 'health',
        features: ['Hospitalization', 'Surgery', 'Medicines'],
        createdAt: new Date(),
        imageUrl: 'https://example.com/health.jpg'
      }
    },
    {
      _id: '2',
      userId: 'user1',
      policyProductId: 'product2',
      status: 'PENDING',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
      premiumPaid: 3000,
      nominee: { name: 'Jane Doe', relation: 'daughter' },
      createdAt: new Date(),
      policyProduct: {
        _id: 'product2',
        title: 'Life Insurance',
        code: 'LI001',
        description: 'Term life coverage',
        premium: 3000,
        termMonths: 240,
        minSumInsured: 500000,
        maxSumInsured: 5000000,
        category: 'life',
        features: ['Death benefit', 'Accidental death'],
        createdAt: new Date(),
        imageUrl: 'https://example.com/life.jpg'
      }
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getUserPolicies']);

    await TestBed.configureTestingModule({
      imports: [MyPoliciesComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyPoliciesComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    // Reset all spies before each test
    apiService.getUserPolicies.calls.reset();
    
    apiService.getUserPolicies.and.returnValue(of(mockPolicies));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.policies).toEqual([]);
    expect(component.isLoading).toBe(true);
  });

  it('should load policies on init', () => {
    component.ngOnInit();

    expect(apiService.getUserPolicies).toHaveBeenCalled();
  });

  it('should load policies successfully', () => {
    component.loadPolicies();

    expect(component.policies).toEqual(mockPolicies);
    expect(component.isLoading).toBe(false);
  });

  it('should handle direct array response', () => {
    apiService.getUserPolicies.and.returnValue(of(mockPolicies));

    component.loadPolicies();

    expect(component.policies).toEqual(mockPolicies);
  });

  it('should handle wrapped response', () => {
    const wrappedResponse = { data: mockPolicies };
    apiService.getUserPolicies.and.returnValue(of(wrappedResponse));

    component.loadPolicies();

    expect(component.policies).toEqual(mockPolicies);
  });

  it('should handle API error', () => {
    apiService.getUserPolicies.and.returnValue(throwError(() => new Error('API Error')));

    component.loadPolicies();

    expect(component.policies).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should return correct status colors', () => {
    expect(component.getStatusColor('ACTIVE')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('PENDING')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('CANCELLED')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('EXPIRED')).toBe('text-gray-600 bg-gray-100');
    expect(component.getStatusColor('UNKNOWN')).toBe('text-gray-600 bg-gray-100');
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(5000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('5,000');
  });

  it('should format date correctly', () => {
    const date = new Date('2025-01-01');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2025');
  });

  it('should handle empty response', () => {
    apiService.getUserPolicies.and.returnValue(of([]));

    component.loadPolicies();

    expect(component.policies).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should handle null response data', () => {
    const nullResponse = { data: null };
    apiService.getUserPolicies.and.returnValue(of(nullResponse));

    component.loadPolicies();

    expect(component.policies).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should handle undefined response data', () => {
    const undefinedResponse = { data: undefined };
    apiService.getUserPolicies.and.returnValue(of(undefinedResponse));

    component.loadPolicies();

    expect(component.policies).toEqual([]);
    expect(component.isLoading).toBe(false);
  });
});

