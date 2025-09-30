import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ClaimsComponent } from './claims.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Claim, ClaimSubmissionRequest } from '../../models/claim.model';
import { UserPolicy } from '../../models/policy.model';

describe('ClaimsComponent', () => {
  let component: ClaimsComponent;
  let fixture: ComponentFixture<ClaimsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockClaims: Claim[] = [
    {
      _id: '1',
      userId: 'user1',
      userPolicyId: 'policy1',
      policyId: 'policy1',
      incidentDate: new Date('2025-01-01'),
      description: 'Test claim',
      amountClaimed: 10000,
      status: 'PENDING',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      _id: '2',
      userId: 'user1',
      userPolicyId: 'policy2',
      policyId: 'policy2',
      incidentDate: new Date('2025-01-02'),
      description: 'Another claim',
      amountClaimed: 5000,
      status: 'APPROVED',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    }
  ];

  const mockUserPolicies: UserPolicy[] = [
    {
      _id: 'policy1',
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
      _id: 'policy2',
      userId: 'user1',
      policyProductId: 'product2',
      status: 'ACTIVE',
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

  const mockClaimResponse = {
    success: true,
    data: { _id: '3', status: 'PENDING' }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', [
      'getClaims',
      'getUserPolicies',
      'submitClaim',
      'cancelClaim'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [ClaimsComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    // Reset all spies before each test
    apiService.getClaims.calls.reset();
    apiService.getUserPolicies.calls.reset();
    apiService.submitClaim.calls.reset();
    apiService.cancelClaim.calls.reset();
    
    // Set up default return values
    apiService.getClaims.and.returnValue(of(mockClaims));
    apiService.getUserPolicies.and.returnValue(of(mockUserPolicies));
    apiService.submitClaim.and.returnValue(of(mockClaimResponse));
    apiService.cancelClaim.and.returnValue(of({ success: true }));
  });

  it('should create, initialize, and load data', () => {
    // Test component creation and initialization
    expect(component).toBeTruthy();
    expect(component.claims).toEqual([]);
    expect(component.userPolicies).toEqual([]);
    expect(component.isLoading).toBe(true);
    expect(component.showClaimForm).toBe(false);
    expect(component.isSubmittingClaim).toBe(false);
    expect(component.claimForm.policyId).toBe('');
    expect(component.claimForm.incidentDate).toBe('');
    expect(component.claimForm.description).toBe('');
    expect(component.claimForm.amount).toBe(0);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');

    // Test data loading on init
    component.ngOnInit();
    expect(apiService.getClaims).toHaveBeenCalled();
    expect(apiService.getUserPolicies).toHaveBeenCalled();

    // Test successful claims loading
    component.loadClaims();
    expect(component.claims).toEqual(mockClaims);
    expect(component.isLoading).toBe(false);

    // Test claims loading error
    apiService.getClaims.and.returnValue(throwError(() => new Error('API Error')));
    component.loadClaims();
    expect(component.claims).toEqual([]);
    expect(component.isLoading).toBe(false);

    // Test user policies loading and filtering
    const mixedPolicies = [
      ...mockUserPolicies,
      { _id: 'policy3', status: 'INACTIVE', policyProduct: { title: 'Inactive Policy' } }
    ];
    apiService.getUserPolicies.and.returnValue(of(mixedPolicies));
    component.loadUserPolicies();
    expect(component.userPolicies).toEqual(mockUserPolicies);

    // Test user policies loading error
    apiService.getUserPolicies.and.returnValue(throwError(() => new Error('API Error')));
    component.loadUserPolicies();
    expect(component.userPolicies).toEqual([]);
  });

  it('should handle claim form operations and submission', () => {
    // Test showing form when user has active policies
    component.userPolicies = mockUserPolicies;
    component.showClaimForm = false; // Ensure initial state
    spyOn(window, 'alert');
    component.onNewClaimClick();
    expect(component.showClaimForm).toBe(true);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(window.alert).not.toHaveBeenCalled();

    // Test showing alert when no active policies
    component.userPolicies = [];
    component.showClaimForm = false; // Reset state
    component.onNewClaimClick();
    expect(component.showClaimForm).toBe(false);
    expect(window.alert).toHaveBeenCalledWith('You need to have an active policy to file a claim. Please purchase a policy first from the Policies page.');

    // Test successful claim submission
    component.userPolicies = mockUserPolicies;
    component.claimForm = {
      policyId: 'policy1',
      incidentDate: '2025-01-01',
      description: 'Test claim',
      amount: 10000,
    };
    component.onClaimSubmit();
    expect(apiService.submitClaim).toHaveBeenCalledWith({
      policyId: 'policy1',
      incidentDate: '2025-01-01',
      description: 'Test claim',
      amount: 10000
    });
    expect(component.isSubmittingClaim).toBe(false);
    expect(component.successMessage).toBe('Claim submitted successfully!');
    expect(component.showClaimForm).toBe(false);

    // Test validation error
    apiService.submitClaim.calls.reset(); // Reset spy calls
    component.claimForm = {
      policyId: '',
      incidentDate: '',
      description: '',
      amount: 0,
    };
    component.onClaimSubmit();
    expect(component.errorMessage).toBe('Please fill in all required fields.');
    expect(apiService.submitClaim).not.toHaveBeenCalled();

    // Test submission error
    const errorResponse = { error: { message: 'Invalid policy' } };
    apiService.submitClaim.and.returnValue(throwError(() => errorResponse));
    component.claimForm = {
      policyId: 'policy1',
      incidentDate: '2025-01-01',
      description: 'Test claim',
      amount: 10000,
    };
    component.onClaimSubmit();
    expect(component.isSubmittingClaim).toBe(false);
    expect(component.errorMessage).toBe('Invalid policy');
  });

  it('should handle utility functions, form management, and claim cancellation', () => {
    // Test form reset
    component.claimForm = {
      policyId: 'policy1',
      incidentDate: '2025-01-01',
      description: 'Test claim',
      amount: 10000,
    };
    component.resetClaimForm();
    expect(component.claimForm.policyId).toBe('');
    expect(component.claimForm.incidentDate).toBe('');
    expect(component.claimForm.description).toBe('');
    expect(component.claimForm.amount).toBe(0);

    // Test form cancellation
    component.showClaimForm = true;
    component.errorMessage = 'Some error';
    component.successMessage = 'Some success';
    component.onCancelClaim();
    expect(component.showClaimForm).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');

    // Test status colors
    expect(component.getStatusColor('PENDING')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('APPROVED')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('REJECTED')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('CANCELLED')).toBe('text-gray-600 bg-gray-100');
    expect(component.getStatusColor('UNKNOWN')).toBe('text-gray-600 bg-gray-100');

    // Test formatting functions
    const formatted = component.formatCurrency(10000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('10,000');

    const date = new Date('2025-01-01');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toContain('Jan');
    expect(formattedDate).toContain('2025');

    // Test claim cancellation with confirmation
    let confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    component.cancelClaim('claim1');
    expect(apiService.cancelClaim).toHaveBeenCalledWith('claim1');

    // Test cancellation without confirmation
    apiService.cancelClaim.calls.reset(); // Reset spy calls
    confirmSpy.and.returnValue(false);
    component.cancelClaim('claim1');
    expect(apiService.cancelClaim).not.toHaveBeenCalled();

    // Test cancellation error
    confirmSpy.and.returnValue(true);
    const errorResponse = { error: { message: 'Cannot cancel claim' } };
    apiService.cancelClaim.and.returnValue(throwError(() => errorResponse));
    component.cancelClaim('claim1');
    expect(component.errorMessage).toBe('Cannot cancel claim');
    expect(component.successMessage).toBe('');

    // Test refresh policies
    spyOn(component, 'loadUserPolicies');
    component.refreshPolicies();
    expect(component.loadUserPolicies).toHaveBeenCalled();
  });
});