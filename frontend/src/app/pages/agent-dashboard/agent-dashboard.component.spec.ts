import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AgentDashboardComponent } from './agent-dashboard.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MockDataService } from '../../services/mock-data.service';
import { ClaimStatusService } from '../../services/claim-status.service';

describe('AgentDashboardComponent', () => {
  let component: AgentDashboardComponent;
  let fixture: ComponentFixture<AgentDashboardComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let mockDataService: jasmine.SpyObj<MockDataService>;
  let claimStatusService: jasmine.SpyObj<ClaimStatusService>;

  const mockAgentDashboard = {
    success: true,
    data: {
      stats: {
        assignedPolicies: 25,
        pendingClaims: 8,
        totalCommissions: 15000
      },
      assignedPolicies: [],
      assignedClaims: []
    }
  };

  const mockPolicies = [
    { 
      _id: '1', 
      title: 'Health Insurance', 
      description: 'Health coverage',
      category: 'health',
      premium: 5000,
      minSumInsured: 100000,
      maxSumInsured: 1000000,
      termMonths: 12,
      code: 'HI001',
      imageUrl: 'https://example.com/health.jpg',
      features: ['Hospitalization'],
      createdAt: new Date()
    },
    { 
      _id: '2', 
      title: 'Life Insurance', 
      description: 'Life coverage',
      category: 'life',
      premium: 3000,
      minSumInsured: 500000,
      maxSumInsured: 5000000,
      termMonths: 240,
      code: 'LI001',
      imageUrl: 'https://example.com/life.jpg',
      features: ['Death benefit'],
      createdAt: new Date()
    }
  ];

  const mockAgents = [
    { _id: '1', name: 'Agent 1', email: 'agent1@example.com' },
    { _id: '2', name: 'Agent 2', email: 'agent2@example.com' }
  ];

  const mockPerformance = {
    success: true,
    data: {
      totalCustomers: 50,
      claimsResolved: 15,
      claimsPending: 8,
      averageResponseTime: 24,
      customerSatisfaction: 4.5,
      conversionRate: 75
    }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', [
      'getAgentDashboard',
      'getPolicies',
      'getAllAgentsForAgent',
      'updateAgentClaimStatus',
      'getAgentPerformance'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const mockDataSpy = jasmine.createSpyObj('MockDataService', [
      'getMockAgentDashboard',
      'getMockPolicies',
      'getMockAgentPerformance'
    ]);
    const claimStatusSpy = jasmine.createSpyObj('ClaimStatusService', ['updateClaimStatus']);

    await TestBed.configureTestingModule({
      imports: [AgentDashboardComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: MockDataService, useValue: mockDataSpy },
        { provide: ClaimStatusService, useValue: claimStatusSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentDashboardComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDataService = TestBed.inject(MockDataService) as jasmine.SpyObj<MockDataService>;
    claimStatusService = TestBed.inject(ClaimStatusService) as jasmine.SpyObj<ClaimStatusService>;
  });

  beforeEach(() => {
    // Reset all spies before each test
    apiService.getAgentDashboard.calls.reset();
    apiService.getPolicies.calls.reset();
    apiService.getAllAgentsForAgent.calls.reset();
    apiService.updateAgentClaimStatus.calls.reset();
    apiService.getAgentPerformance.calls.reset();
    mockDataService.getMockAgentDashboard.calls.reset();
    mockDataService.getMockPolicies.calls.reset();
    mockDataService.getMockAgentPerformance.calls.reset();
    
    authService.getCurrentUser.and.returnValue({ 
      _id: 'agent1', 
      name: 'Agent User',
      email: 'agent@example.com',
      role: 'agent',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    apiService.getAgentDashboard.and.returnValue(of(mockAgentDashboard));
    apiService.getPolicies.and.returnValue(of(mockPolicies));
    apiService.getAllAgentsForAgent.and.returnValue(of({ success: true, data: mockAgents }));
    apiService.updateAgentClaimStatus.and.returnValue(of({ success: true }));
    apiService.getAgentPerformance.and.returnValue(of(mockPerformance));
    mockDataService.getMockAgentDashboard.and.returnValue(of(mockAgentDashboard));
    mockDataService.getMockPolicies.and.returnValue(of(mockPolicies));
    mockDataService.getMockAgentPerformance.and.returnValue(of(mockPerformance));
  });

  it('should create, initialize, and load agent data', () => {
    expect(component).toBeTruthy();
    expect(component.currentUser).toBeNull();
    expect(component.stats.assignedPolicies).toBe(0);
    expect(component.stats.pendingClaims).toBe(0);
    expect(component.stats.totalCommissions).toBe(0);
    expect(component.assignedPolicies).toEqual([]);
    expect(component.pendingClaims).toEqual([]);
    expect(component.policies).toEqual([]);
    expect(component.otherAgents).toEqual([]);
    expect(component.isLoading).toBe(true);

    component.ngOnInit();
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(apiService.getAgentDashboard).toHaveBeenCalled();
    expect(apiService.getPolicies).toHaveBeenCalled();
    expect(apiService.getAllAgentsForAgent).toHaveBeenCalled();

    // Test stats update
    component.loadAgentData();
    expect(component.stats.assignedPolicies).toBe(25);
    expect(component.stats.pendingClaims).toBe(8);
    expect(component.stats.totalCommissions).toBe(15000);
    expect(component.assignedPolicies).toEqual(mockAgentDashboard.data.assignedPolicies);
    expect(component.pendingClaims).toEqual(mockAgentDashboard.data.assignedClaims);
    expect(component.isLoading).toBe(false);

    // Test successful policy loading
    component.loadPolicies();
    expect(component.policies).toEqual(mockPolicies);

    // Test policy loading with API failure
    apiService.getPolicies.and.returnValue(throwError(() => new Error('API Error')));
    component.loadPolicies();
    expect(mockDataService.getMockPolicies).toHaveBeenCalled();

    // Test agent loading and filtering
    component.currentUser = { _id: '1', role: 'agent' };
    component.loadOtherAgents();
    expect(component.otherAgents).toEqual([mockAgents[1]]);

    // Test empty responses
    apiService.getPolicies.and.returnValue(of([]));
    apiService.getAllAgentsForAgent.and.returnValue(of({ success: true, data: [] }));
    component.loadPolicies();
    component.loadOtherAgents();
    expect(component.policies).toEqual([]);
    expect(component.otherAgents).toEqual([]);

    // Test agent dashboard API error
    apiService.getAgentDashboard.and.returnValue(throwError(() => new Error('API Error')));
    component.loadAgentData();
    expect(mockDataService.getMockAgentDashboard).toHaveBeenCalled();
  });

  it('should handle utility functions, claim operations, and performance reports', () => {
    // Test currency formatting
    const formatted = component.formatCurrency(15000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('15,000');

    // Test date formatting
    const date = new Date('2025-01-01');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toContain('Jan');
    expect(formattedDate).toContain('2025');

    // Test claim status update
    component.updateClaimStatus('claim1', 'APPROVED', 'Approved by agent');
    expect(apiService.updateAgentClaimStatus).toHaveBeenCalledWith('claim1', {
      status: 'APPROVED',
      notes: 'Approved by agent'
    });

    // Test claim approval
    spyOn(component, 'updateClaimStatus');
    component.approveClaim('claim1');
    expect(component.updateClaimStatus).toHaveBeenCalledWith('claim1', 'APPROVED', 'Claim approved by agent');

    // Test claim rejection with notes
    let promptSpy = spyOn(window, 'prompt').and.returnValue('Insufficient documentation');
    component.rejectClaim('claim1');
    expect(component.updateClaimStatus).toHaveBeenCalledWith('claim1', 'REJECTED', 'Insufficient documentation');

    // Test claim rejection without notes
    apiService.updateAgentClaimStatus.calls.reset(); // Reset spy calls
    promptSpy.and.returnValue(null);
    component.rejectClaim('claim1');
    expect(apiService.updateAgentClaimStatus).not.toHaveBeenCalled();

    // Test performance reports
    apiService.getAgentPerformance.and.returnValue(of(mockPerformance)); // Reset to success
    const performanceAlertSpy = spyOn(window, 'alert');
    component.showPerformanceReports();
    expect(apiService.getAgentPerformance).toHaveBeenCalled();
    expect(performanceAlertSpy).toHaveBeenCalledWith(jasmine.stringContaining('Performance Report:'));

    // Test performance API failure
    apiService.getAgentPerformance.and.returnValue(throwError(() => new Error('API Error')));
    component.showPerformanceReports();
    expect(mockDataService.getMockAgentPerformance).toHaveBeenCalled();
  });

  it('should handle claim status update errors', () => {
    // Test claim status update error
    apiService.updateAgentClaimStatus.and.returnValue(throwError(() => new Error('API Error')));
    const errorAlertSpy = spyOn(window, 'alert');
    component.updateClaimStatus('claim1', 'APPROVED');
    expect(errorAlertSpy).toHaveBeenCalledWith('Error updating claim status. Please try again.');
  });
});