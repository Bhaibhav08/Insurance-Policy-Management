import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockAdminSummary = {
    success: true,
    totalUsers: 150,
    totalPolicies: 300,
    pendingClaims: 25,
    monthlyRevenue: 500000,
    totalAgents: 10,
    totalCustomers: 140,
    approvedClaims: 200,
    rejectedClaims: 15
  };

  const mockPolicies = [
    { _id: '1', title: 'Health Insurance', premium: 5000 },
    { _id: '2', title: 'Life Insurance', premium: 3000 }
  ];

  const mockUsers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'customer' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'customer' }
  ];

  const mockClaims = [
    { _id: '1', status: 'PENDING', amountClaimed: 10000 },
    { _id: '2', status: 'APPROVED', amountClaimed: 5000 }
  ];

  const mockAgents = [
    { _id: '1', name: 'Agent 1', email: 'agent1@example.com', role: 'agent' },
    { _id: '2', name: 'Agent 2', email: 'agent2@example.com', role: 'agent' }
  ];

  const mockCustomers = [
    { _id: '1', name: 'Customer 1', email: 'customer1@example.com', role: 'customer' },
    { _id: '2', name: 'Customer 2', email: 'customer2@example.com', role: 'customer' }
  ];

  const mockRevenueData = [
    { month: 'January', revenue: 100000 },
    { month: 'February', revenue: 120000 }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', [
      'getAdminSummary',
      'getUsers',
      'getClaims',
      'getPolicies',
      'getAllAgents',
      'getAllCustomers',
      'getMonthlyRevenue'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
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
    apiService.getAdminSummary.and.returnValue(of(mockAdminSummary));
    apiService.getPolicies.and.returnValue(of({ success: true, data: mockPolicies }));
    apiService.getUsers.and.returnValue(of({ success: true, data: mockUsers }));
    apiService.getClaims.and.returnValue(of({ success: true, data: mockClaims }));
    apiService.getAllAgents.and.returnValue(of({ success: true, data: mockAgents }));
    apiService.getAllCustomers.and.returnValue(of({ success: true, data: mockCustomers }));
    apiService.getMonthlyRevenue.and.returnValue(of({ success: true, data: mockRevenueData }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentUser).toBeNull();
    expect(component.stats.totalUsers).toBe(0);
    expect(component.stats.totalPolicies).toBe(0);
    expect(component.stats.pendingClaims).toBe(0);
    expect(component.stats.monthlyRevenue).toBe(0);
    expect(component.policies).toEqual([]);
    expect(component.recentUsers).toEqual([]);
    expect(component.recentClaims).toEqual([]);
    expect(component.agents).toEqual([]);
    expect(component.customers).toEqual([]);
    expect(component.monthlyRevenueData).toEqual([]);
    expect(component.isLoading).toBe(true);
  });

  it('should load admin data on init', () => {
    component.ngOnInit();

    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(apiService.getAdminSummary).toHaveBeenCalled();
    expect(apiService.getPolicies).toHaveBeenCalled();
    expect(apiService.getUsers).toHaveBeenCalled();
    expect(apiService.getClaims).toHaveBeenCalled();
    expect(apiService.getAllAgents).toHaveBeenCalled();
    expect(apiService.getAllCustomers).toHaveBeenCalled();
    expect(apiService.getMonthlyRevenue).toHaveBeenCalled();
  });

  it('should update stats from admin summary response', () => {
    component.loadAdminData();

    expect(component.stats.totalUsers).toBe(150);
    expect(component.stats.totalPolicies).toBe(300);
    expect(component.stats.pendingClaims).toBe(25);
    expect(component.stats.monthlyRevenue).toBe(500000);
    expect(component.stats.totalAgents).toBe(10);
    expect(component.stats.totalCustomers).toBe(140);
    expect(component.stats.approvedClaims).toBe(200);
    expect(component.stats.rejectedClaims).toBe(15);
    expect(component.isLoading).toBe(false);
  });

  it('should load policies successfully', () => {
    component.loadPolicies();

    expect(component.policies).toEqual(mockPolicies);
  });

  it('should handle policies loading error', () => {
    apiService.getPolicies.and.returnValue(throwError(() => new Error('API Error')));

    component.loadPolicies();

    expect(component.policies).toEqual([]);
  });

  it('should load recent users and claims', () => {
    component.loadRecentUsersAndClaims();

    expect(component.recentUsers).toEqual(mockUsers.slice(0, 5));
    expect(component.recentClaims).toEqual(mockClaims.slice(0, 5));
  });

  it('should load agents and customers', () => {
    component.loadAgentsAndCustomers();

    expect(component.agents).toEqual(mockAgents.slice(0, 4));
    expect(component.customers).toEqual(mockCustomers.slice(0, 4));
  });

  it('should load monthly revenue data', () => {
    component.loadMonthlyRevenue();

    expect(component.monthlyRevenueData).toEqual(mockRevenueData);
  });

  it('should handle monthly revenue loading error', () => {
    apiService.getMonthlyRevenue.and.returnValue(throwError(() => new Error('API Error')));

    component.loadMonthlyRevenue();

    expect(component.monthlyRevenueData).toEqual([]);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(500000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('5,00,000');
  });

  it('should calculate percentage correctly', () => {
    expect(component.calculatePercentage(25)).toBe(100);
    expect(component.calculatePercentage(10)).toBe(40);
    expect(component.calculatePercentage(30)).toBe(100);
  });

  it('should handle admin summary error', () => {
    apiService.getAdminSummary.and.returnValue(throwError(() => new Error('API Error')));

    component.loadAdminData();

    expect(component.isLoading).toBe(false);
  });

  it('should handle empty responses', () => {
    apiService.getPolicies.and.returnValue(of({ success: false, data: null }));
    apiService.getUsers.and.returnValue(of({ success: false, data: null }));
    apiService.getClaims.and.returnValue(of({ success: false, data: null }));

    component.loadPolicies();
    component.loadRecentUsersAndClaims();

    expect(component.policies).toEqual([]);
    expect(component.recentUsers).toEqual([]);
    expect(component.recentClaims).toEqual([]);
  });

  it('should set current user on init', () => {
    const mockUser = { 
      _id: 'admin1', 
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    component.ngOnInit();

    expect(component.currentUser).toEqual(mockUser);
  });
});

