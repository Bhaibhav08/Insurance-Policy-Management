import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authSpy.getToken.and.returnValue('mock-token');

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPolicies', () => {
    it('should fetch policies successfully', () => {
      const mockPolicies = [
        { _id: '1', title: 'Health Insurance', premium: 5000 },
        { _id: '2', title: 'Life Insurance', premium: 3000 }
      ];

      service.getPolicies().subscribe(policies => {
        expect(policies).toEqual(mockPolicies);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/policies');
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicies);
    });
  });

  describe('getPolicyById', () => {
    it('should fetch single policy by ID', () => {
      const mockPolicy = { _id: '1', title: 'Health Insurance', premium: 5000 };

      service.getPolicyById('1').subscribe(policy => {
        expect(policy).toEqual(mockPolicy);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/policies/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicy);
    });
  });

  describe('purchasePolicy', () => {
    it('should purchase policy successfully', () => {
      const mockResponse = {
        success: true,
        data: { _id: '1', status: 'ACTIVE' }
      };

      service.purchasePolicy('1', {
        startDate: '2025-01-01',
        termMonths: 12,
        nominee: { name: 'Test Nominee', relation: 'spouse' }
      }).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/policies/1/purchase');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getUserPolicies', () => {
    it('should fetch user policies', () => {
      const mockPolicies = [
        { _id: '1', status: 'ACTIVE', policyProductId: { title: 'Health Insurance' } }
      ];

      service.getUserPolicies().subscribe(policies => {
        expect(policies).toEqual(mockPolicies);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/user/policies');
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicies);
    });
  });

  describe('submitClaim', () => {
    it('should submit claim successfully', () => {
      const mockResponse = {
        success: true,
        data: { _id: '1', status: 'PENDING' }
      };

      service.submitClaim({
        policyId: '1',
        description: 'Test claim',
        incidentDate: '2025-01-01',
        amount: 10000
      }).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/claims');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getClaims', () => {
    it('should fetch claims', () => {
      const mockClaims = [
        { _id: '1', status: 'PENDING', amountClaimed: 10000 }
      ];

      service.getClaims().subscribe(claims => {
        expect(claims).toEqual(mockClaims);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/claims');
      expect(req.request.method).toBe('GET');
      req.flush(mockClaims);
    });
  });

  describe('getPayments', () => {
    it('should fetch user payments', () => {
      const mockPayments = [
        { _id: '1', amount: 5000, method: 'CARD' }
      ];

      service.getPayments().subscribe(payments => {
        expect(payments).toEqual(mockPayments);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/payments');
      expect(req.request.method).toBe('GET');
      req.flush(mockPayments);
    });
  });

  describe('getAllAgents', () => {
    it('should fetch all agents for admin', () => {
      const mockAgents = [
        { _id: '1', name: 'Agent 1', role: 'agent' }
      ];

      service.getAllAgents().subscribe(agents => {
        expect(agents).toEqual(mockAgents);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/users/agents');
      expect(req.request.method).toBe('GET');
      req.flush(mockAgents);
    });
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with parameters', () => {
      const mockLogs = [
        { _id: '1', action: 'LOGIN', details: 'User logged in' }
      ];

      service.getAuditLogs({ page: 1, limit: 10 }).subscribe(logs => {
        expect(logs).toEqual(mockLogs);
      });

      const req = httpMock.expectOne('http://localhost:5000/api/v1/admin/audit?page=1&limit=10');
      expect(req.request.method).toBe('GET');
      req.flush(mockLogs);
    });
  });
});


