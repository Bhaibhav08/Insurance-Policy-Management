import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AgentProfileComponent } from './agent-profile.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

describe('AgentProfileComponent', () => {
  let component: AgentProfileComponent;
  let fixture: ComponentFixture<AgentProfileComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let getSpy: jasmine.Spy;

  const mockAgentDetails = {
    success: true,
    data: {
      agent: {
        _id: 'agent1',
        name: 'Agent Smith',
        email: 'agent@example.com',
        role: 'agent',
        status: 'verified',
        createdAt: new Date('2025-01-01')
      },
      assignedCustomers: [
        { _id: 'customer1', name: 'Customer 1', email: 'customer1@example.com' },
        { _id: 'customer2', name: 'Customer 2', email: 'customer2@example.com' }
      ],
      assignedPolicies: [
        { _id: 'policy1', title: 'Health Insurance', status: 'ACTIVE' },
        { _id: 'policy2', title: 'Life Insurance', status: 'ACTIVE' }
      ],
      claims: [
        { _id: 'claim1', status: 'PENDING', amountClaimed: 10000 },
        { _id: 'claim2', status: 'APPROVED', amountClaimed: 5000 }
      ],
      statistics: {
        totalCustomers: 10,
        totalPolicies: 25,
        totalClaims: 15,
        pendingClaims: 5
      }
    }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getAgentDetails']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    getSpy = jasmine.createSpy('get').and.returnValue('agent1');
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: {
          get: getSpy
        }
      }
    });

    await TestBed.configureTestingModule({
      imports: [AgentProfileComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentProfileComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    apiService.getAgentDetails.and.returnValue(of(mockAgentDetails));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.agentId).toBe('');
    expect(component.agent).toBeNull();
    expect(component.assignedCustomers).toEqual([]);
    expect(component.assignedPolicies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual({});
    expect(component.isLoading).toBe(true);
    expect(component.activeTab).toBe('overview');
  });

  it('should load agent details on init', () => {
    component.ngOnInit();

    expect(component.agentId).toBe('agent1');
    expect(apiService.getAgentDetails).toHaveBeenCalledWith('agent1');
  });

  it('should load agent details successfully', () => {
    component.loadAgentDetails();

    expect(component.agent).toEqual(mockAgentDetails.data.agent);
    expect(component.assignedCustomers).toEqual(mockAgentDetails.data.assignedCustomers);
    expect(component.assignedPolicies).toEqual(mockAgentDetails.data.assignedPolicies);
    expect(component.claims).toEqual(mockAgentDetails.data.claims);
    expect(component.statistics).toEqual(mockAgentDetails.data.statistics);
    expect(component.isLoading).toBe(false);
  });

  it('should handle API error', () => {
    apiService.getAgentDetails.and.returnValue(throwError(() => new Error('API Error')));

    component.loadAgentDetails();

    expect(component.isLoading).toBe(false);
  });

  it('should set active tab', () => {
    component.setActiveTab('customers');

    expect(component.activeTab).toBe('customers');
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

  it('should return correct status colors', () => {
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
  });

  it('should handle empty agent ID', () => {
    getSpy.and.returnValue(null);
    component.ngOnInit();

    expect(component.agentId).toBe('');
    expect(apiService.getAgentDetails).not.toHaveBeenCalled();
  });

  it('should handle response without data', () => {
    const emptyResponse = { success: true, data: null };
    apiService.getAgentDetails.and.returnValue(of(emptyResponse));

    component.loadAgentDetails();

    expect(component.agent).toBeNull();
    expect(component.assignedCustomers).toEqual([]);
    expect(component.assignedPolicies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual({});
  });

  it('should handle response with success false', () => {
    const failedResponse = { success: false, data: mockAgentDetails.data };
    apiService.getAgentDetails.and.returnValue(of(failedResponse));

    component.loadAgentDetails();

    expect(component.agent).toBeNull();
    expect(component.assignedCustomers).toEqual([]);
    expect(component.assignedPolicies).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.statistics).toEqual({});
  });

  it('should handle different tab selections', () => {
    const tabs = ['overview', 'customers', 'policies', 'claims'];
    
    tabs.forEach(tab => {
      component.setActiveTab(tab);
      expect(component.activeTab).toBe(tab);
    });
  });

  it('should handle different date formats', () => {
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
  });

  it('should handle different currency amounts', () => {
    const amounts = [0, 100, 1000, 10000, 100000, 1000000];
    
    amounts.forEach(amount => {
      const formatted = component.formatCurrency(amount);
      expect(formatted).toContain('₹');
    });
  });
});

