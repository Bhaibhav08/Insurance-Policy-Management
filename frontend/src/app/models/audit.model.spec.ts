import { AuditLog, AdminSummary } from './audit.model';

describe('AuditLog Interface', () => {
  it('should create a valid AuditLog object', () => {
    const auditLog: AuditLog = {
      _id: 'audit1',
      action: 'LOGIN',
      actorId: 'user1',
      actor: {
        _id: 'user1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
      ip: '192.168.1.1',
      timestamp: new Date('2025-01-01T10:00:00Z')
    };

    expect(auditLog._id).toBe('audit1');
    expect(auditLog.action).toBe('LOGIN');
    expect(auditLog.actorId).toBe('user1');
    expect(auditLog.actor?.name).toBe('John Doe');
    expect(auditLog.actor?.email).toBe('john@example.com');
    expect(auditLog.details).toEqual({ ip: '192.168.1.1', userAgent: 'Mozilla/5.0' });
    expect(auditLog.ip).toBe('192.168.1.1');
    expect(auditLog.timestamp).toBeInstanceOf(Date);
  });

  it('should create AuditLog without optional actor', () => {
    const auditLog: AuditLog = {
      _id: 'audit2',
      action: 'LOGOUT',
      actorId: 'user2',
      details: { ip: '192.168.1.2' },
      ip: '192.168.1.2',
      timestamp: new Date('2025-01-01T11:00:00Z')
    };

    expect(auditLog._id).toBe('audit2');
    expect(auditLog.action).toBe('LOGOUT');
    expect(auditLog.actorId).toBe('user2');
    expect(auditLog.actor).toBeUndefined();
    expect(auditLog.details).toEqual({ ip: '192.168.1.2' });
    expect(auditLog.ip).toBe('192.168.1.2');
    expect(auditLog.timestamp).toBeInstanceOf(Date);
  });

  it('should handle different action types', () => {
    const actions = ['LOGIN', 'LOGOUT', 'POLICY_CREATED', 'CLAIM_SUBMITTED', 'PAYMENT_PROCESSED'];
    
    actions.forEach(action => {
      const auditLog: AuditLog = {
        _id: 'audit1',
        action,
        actorId: 'user1',
        details: {},
        ip: '192.168.1.1',
        timestamp: new Date()
      };

      expect(auditLog.action).toBe(action);
    });
  });
});

describe('AdminSummary Interface', () => {
  it('should create a valid AdminSummary object', () => {
    const adminSummary: AdminSummary = {
      totalUsers: 100,
      totalPolicies: 250,
      totalClaims: 50,
      pendingClaims: 10,
      totalPayments: 200,
      monthlyRevenue: 500000,
      activeAgents: 15
    };

    expect(adminSummary.totalUsers).toBe(100);
    expect(adminSummary.totalPolicies).toBe(250);
    expect(adminSummary.totalClaims).toBe(50);
    expect(adminSummary.pendingClaims).toBe(10);
    expect(adminSummary.totalPayments).toBe(200);
    expect(adminSummary.monthlyRevenue).toBe(500000);
    expect(adminSummary.activeAgents).toBe(15);
  });

  it('should handle different numeric values', () => {
    const zeroSummary: AdminSummary = {
      totalUsers: 0,
      totalPolicies: 0,
      totalClaims: 0,
      pendingClaims: 0,
      totalPayments: 0,
      monthlyRevenue: 0,
      activeAgents: 0
    };

    expect(zeroSummary.totalUsers).toBe(0);
    expect(zeroSummary.totalPolicies).toBe(0);
    expect(zeroSummary.totalClaims).toBe(0);
    expect(zeroSummary.pendingClaims).toBe(0);
    expect(zeroSummary.totalPayments).toBe(0);
    expect(zeroSummary.monthlyRevenue).toBe(0);
    expect(zeroSummary.activeAgents).toBe(0);

    const largeSummary: AdminSummary = {
      totalUsers: 1000000,
      totalPolicies: 5000000,
      totalClaims: 100000,
      pendingClaims: 5000,
      totalPayments: 2000000,
      monthlyRevenue: 100000000,
      activeAgents: 1000
    };

    expect(largeSummary.totalUsers).toBe(1000000);
    expect(largeSummary.totalPolicies).toBe(5000000);
    expect(largeSummary.totalClaims).toBe(100000);
    expect(largeSummary.pendingClaims).toBe(5000);
    expect(largeSummary.totalPayments).toBe(2000000);
    expect(largeSummary.monthlyRevenue).toBe(100000000);
    expect(largeSummary.activeAgents).toBe(1000);
  });
});

