import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMockAgentDashboard', () => {
    it('should return mock agent dashboard data', (done) => {
      service.getMockAgentDashboard().subscribe(data => {
        expect(data.success).toBe(true);
        expect(data.data.stats).toBeDefined();
        expect(data.data.assignedPolicies).toEqual([]);
        expect(data.data.assignedClaims).toEqual([]);
        done();
      });
    });
  });

  describe('getMockAgentPerformance', () => {
    it('should return mock agent performance data', (done) => {
      service.getMockAgentPerformance().subscribe(data => {
        expect(data.success).toBe(true);
        expect(data.data.totalCustomers).toBeDefined();
        expect(data.data.claimsResolved).toBeDefined();
        expect(data.data.customerSatisfaction).toBeDefined();
        done();
      });
    });
  });

  describe('getMockPolicies', () => {
    it('should return mock policies array', (done) => {
      service.getMockPolicies().subscribe(policies => {
        expect(Array.isArray(policies)).toBe(true);
        expect(policies.length).toBeGreaterThan(0);
        expect(policies[0].hasOwnProperty('_id')).toBe(true);
        expect(policies[0].hasOwnProperty('title')).toBe(true);
        expect(policies[0].hasOwnProperty('premium')).toBe(true);
        done();
      });
    });
  });

  describe('getMockCustomerDashboard', () => {
    it('should return mock customer dashboard data', (done) => {
      service.getMockCustomerDashboard().subscribe(data => {
        expect(data.success).toBe(true);
        expect(data.data.policies).toBeDefined();
        expect(data.data.claims).toBeDefined();
        expect(data.data.payments).toBeDefined();
        done();
      });
    });
  });

  describe('getMockAdminDashboard', () => {
    it('should return mock admin dashboard data', (done) => {
      service.getMockAdminDashboard().subscribe(data => {
        expect(data.success).toBe(true);
        expect(data.data.stats).toBeDefined();
        expect(data.data.policies).toBeDefined();
        expect(data.data.recentUsers).toEqual([]);
        expect(data.data.recentClaims).toEqual([]);
        done();
      });
    });
  });
});


