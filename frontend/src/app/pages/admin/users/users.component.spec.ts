import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UsersComponent } from './users.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockAgents = [
    {
      _id: '1',
      name: 'Agent 1',
      email: 'agent1@example.com',
      role: 'agent',
      status: 'verified',
      createdAt: new Date('2025-01-01')
    },
    {
      _id: '2',
      name: 'Agent 2',
      email: 'agent2@example.com',
      role: 'agent',
      status: 'pending',
      createdAt: new Date('2025-01-02')
    }
  ];

  const mockCustomers = [
    {
      _id: '3',
      name: 'Customer 1',
      email: 'customer1@example.com',
      role: 'customer',
      status: 'ACTIVE',
      createdAt: new Date('2025-01-01')
    },
    {
      _id: '4',
      name: 'Customer 2',
      email: 'customer2@example.com',
      role: 'customer',
      status: 'PENDING',
      createdAt: new Date('2025-01-02')
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getAllAgents', 'getAllCustomers']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [UsersComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
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
    apiService.getAllAgents.and.returnValue(of({ success: true, data: mockAgents }));
    apiService.getAllCustomers.and.returnValue(of({ success: true, data: mockCustomers }));
  });

  it('should create, initialize, and load data', () => {
    expect(component).toBeTruthy();
    expect(component.currentUser).toBeNull();
    expect(component.agents).toEqual([]);
    expect(component.customers).toEqual([]);
    expect(component.isLoading).toBe(true);
    expect(component.activeTab).toBe('agents');
    expect(component.searchTerm).toBe('');

    component.ngOnInit();
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(apiService.getAllAgents).toHaveBeenCalled();
    expect(apiService.getAllCustomers).toHaveBeenCalled();

    // Test successful agent loading
    component.loadAgents();
    expect(component.agents).toEqual(mockAgents);
    expect(component.isLoading).toBe(false);

    // Test agent loading error
    apiService.getAllAgents.and.returnValue(throwError(() => new Error('API Error')));
    component.agents = []; // Reset agents array
    component.loadAgents();
    expect(component.agents).toEqual([]);
    expect(component.isLoading).toBe(false);

    // Test successful customer loading
    apiService.getAllCustomers.and.returnValue(of({ success: true, data: mockCustomers }));
    component.loadCustomers();
    expect(component.customers).toEqual(mockCustomers);

    // Test customer loading error
    apiService.getAllCustomers.and.returnValue(throwError(() => new Error('API Error')));
    component.customers = []; // Reset customers array
    component.loadCustomers();
    expect(component.customers).toEqual([]);

    // Test empty responses
    apiService.getAllAgents.and.returnValue(of({ success: true, data: [] }));
    apiService.getAllCustomers.and.returnValue(of({ success: true, data: [] }));
    component.loadAgents();
    component.loadCustomers();
    expect(component.agents).toEqual([]);
    expect(component.customers).toEqual([]);

    // Test API response with success: false
    apiService.getAllAgents.and.returnValue(of({ success: false, data: null }));
    component.loadAgents();
    expect(component.agents).toEqual([]);
  });

  it('should handle tab switching, filtering, and utility functions', () => {
    // Test tab switching
    component.setActiveTab('customers');
    expect(component.activeTab).toBe('customers');

    component.setActiveTab('agents');
    expect(component.activeTab).toBe('agents');

    // Test filtering agents
    component.agents = mockAgents;
    component.searchTerm = 'agent1';
    expect(component.getFilteredAgents().length).toBe(1);
    expect(component.getFilteredAgents()[0].name).toBe('Agent 1');

    component.searchTerm = 'agent';
    expect(component.getFilteredAgents().length).toBe(2);

    component.searchTerm = 'nonexistent';
    expect(component.getFilteredAgents().length).toBe(0);

    // Test filtering customers
    component.customers = mockCustomers;
    component.searchTerm = 'customer1';
    expect(component.getFilteredCustomers().length).toBe(1);
    expect(component.getFilteredCustomers()[0].name).toBe('Customer 1');

    component.searchTerm = 'customer';
    expect(component.getFilteredCustomers().length).toBe(2);

    component.searchTerm = 'nonexistent';
    expect(component.getFilteredCustomers().length).toBe(0);

    // Test case-insensitive filtering
    component.searchTerm = 'AGENT1';
    expect(component.getFilteredAgents().length).toBe(1);

    component.searchTerm = 'CUSTOMER1';
    expect(component.getFilteredCustomers().length).toBe(1);

    // Test utility functions
    const formatted = component.formatCurrency(10000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('10,000');

    const date = new Date('2025-01-01');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toContain('Jan');
    expect(formattedDate).toContain('2025');

    // Test status colors
    expect(component.getStatusColor('verified')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('pending')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('rejected')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('ACTIVE')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('PENDING')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('CANCELLED')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('EXPIRED')).toBe('text-gray-600 bg-gray-100');
    expect(component.getStatusColor('UNKNOWN')).toBe('text-gray-600 bg-gray-100');
  });
});