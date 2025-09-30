import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuditComponent } from './audit.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { AuditLog } from '../../../models/audit.model';

describe('AuditComponent', () => {
  let component: AuditComponent;
  let fixture: ComponentFixture<AuditComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockAuditLogs: AuditLog[] = [
    {
      _id: '1',
      actorId: 'user1',
      action: 'LOGIN',
      details: { message: 'User logged in' },
      ip: '192.168.1.1',
      timestamp: new Date('2025-01-01T10:00:00Z')
    },
    {
      _id: '2',
      actorId: 'user2',
      action: 'POLICY_CREATED',
      details: { message: 'New policy created' },
      ip: '192.168.1.2',
      timestamp: new Date('2025-01-01T11:00:00Z')
    }
  ];

  const mockResponse = {
    success: true,
    data: mockAuditLogs,
    pagination: {
      page: 1,
      pages: 5,
      total: 100
    }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getAuditLogs']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [AuditComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditComponent);
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
    apiService.getAuditLogs.and.returnValue(of(mockResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentUser).toBeNull();
    expect(component.auditLogs).toEqual([]);
    expect(component.isLoading).toBe(true);
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.totalLogs).toBe(0);
    expect(component.limit).toBe(20);
  });

  it('should load audit logs on init', () => {
    component.ngOnInit();
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(apiService.getAuditLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 20
    });
    expect(component.auditLogs).toEqual(mockAuditLogs);
    expect(component.totalPages).toBe(5);
    expect(component.totalLogs).toBe(100);
    expect(component.isLoading).toBe(false);
  });

  it('should apply filters correctly', () => {
    component.actionFilter = 'LOGIN';
    component.userIdFilter = 'user1';
    component.startDate = '2025-01-01';
    component.endDate = '2025-01-31';
    component.currentPage = 2;

    component.applyFilters();

    expect(component.currentPage).toBe(1);
    expect(apiService.getAuditLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      action: 'LOGIN',
      userId: 'user1',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    });
  });

  it('should clear filters correctly', () => {
    component.actionFilter = 'LOGIN';
    component.userIdFilter = 'user1';
    component.startDate = '2025-01-01';
    component.endDate = '2025-01-31';
    component.currentPage = 3;

    component.clearFilters();

    expect(component.actionFilter).toBe('');
    expect(component.userIdFilter).toBe('');
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.currentPage).toBe(1);
    expect(apiService.getAuditLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 20
    });
  });

  it('should navigate to valid page', () => {
    component.totalPages = 5;
    component.currentPage = 2;

    component.goToPage(3);

    expect(component.currentPage).toBe(3);
    expect(apiService.getAuditLogs).toHaveBeenCalled();
  });

  it('should not navigate to invalid page', () => {
    component.totalPages = 5;
    component.currentPage = 2;

    component.goToPage(0);
    expect(component.currentPage).toBe(2);

    component.goToPage(6);
    expect(component.currentPage).toBe(2);
  });

  it('should return correct action colors', () => {
    expect(component.getActionColor('LOGIN')).toBe('text-green-600 bg-green-100');
    expect(component.getActionColor('LOGOUT')).toBe('text-gray-600 bg-gray-100');
    expect(component.getActionColor('POLICY_CREATED')).toBe('text-blue-600 bg-blue-100');
    expect(component.getActionColor('CLAIM_APPROVED')).toBe('text-green-600 bg-green-100');
    expect(component.getActionColor('CLAIM_REJECTED')).toBe('text-red-600 bg-red-100');
    expect(component.getActionColor('UNKNOWN_ACTION')).toBe('text-gray-600 bg-gray-100');
  });

  it('should format date correctly', () => {
    const date = new Date('2025-01-01T10:30:00Z');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2025');
  });

  it('should format action correctly', () => {
    expect(component.formatAction('POLICY_CREATED')).toBe('Policy Created');
    expect(component.formatAction('CLAIM_APPROVED')).toBe('Claim Approved');
    expect(component.formatAction('USER_UPDATED')).toBe('User Updated');
  });

  it('should handle API error', () => {
    const errorResponse = { error: { message: 'Failed to load audit logs' } };
    apiService.getAuditLogs.and.returnValue(throwError(() => errorResponse));

    component.loadAuditLogs();

    expect(component.isLoading).toBe(false);
  });

  it('should handle empty response', () => {
    const emptyResponse = { success: true, data: [] };
    apiService.getAuditLogs.and.returnValue(of(emptyResponse));

    component.loadAuditLogs();

    expect(component.auditLogs).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should have correct available actions', () => {
    expect(component.availableActions).toContain('LOGIN');
    expect(component.availableActions).toContain('LOGOUT');
    expect(component.availableActions).toContain('POLICY_CREATED');
    expect(component.availableActions).toContain('CLAIM_CREATED');
    expect(component.availableActions).toContain('PAYMENT_PROCESSED');
  });
});

