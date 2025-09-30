import { Claim, ClaimSubmissionRequest, ClaimStatusUpdate } from './claim.model';

describe('Claim Interface', () => {
  it('should create a valid Claim object', () => {
    const claim: Claim = {
      _id: 'claim1',
      userId: 'user1',
      userPolicyId: 'policy1',
      userPolicy: {
        _id: 'policy1',
        policyProductId: 'product1',
        policyProduct: {
          _id: 'product1',
          title: 'Health Insurance',
          code: 'HI001'
        }
      },
      incidentDate: new Date('2025-01-01'),
      description: 'Medical emergency claim',
      amountClaimed: 10000,
      status: 'PENDING',
      decisionNotes: 'Under review',
      decidedByAgentId: 'agent1',
      decidedByAgent: {
        _id: 'agent1',
        name: 'Agent Smith',
        email: 'agent@example.com'
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    };

    expect(claim._id).toBe('claim1');
    expect(claim.userId).toBe('user1');
    expect(claim.userPolicyId).toBe('policy1');
    expect(claim.userPolicy?._id).toBe('policy1');
    expect(claim.userPolicy?.policyProduct?.title).toBe('Health Insurance');
    expect(claim.incidentDate).toBeInstanceOf(Date);
    expect(claim.description).toBe('Medical emergency claim');
    expect(claim.amountClaimed).toBe(10000);
    expect(claim.status).toBe('PENDING');
    expect(claim.decisionNotes).toBe('Under review');
    expect(claim.decidedByAgentId).toBe('agent1');
    expect(claim.decidedByAgent?.name).toBe('Agent Smith');
    expect(claim.createdAt).toBeInstanceOf(Date);
    expect(claim.updatedAt).toBeInstanceOf(Date);
  });

  it('should create Claim without optional fields', () => {
    const claim: Claim = {
      _id: 'claim2',
      userId: 'user2',
      userPolicyId: 'policy2',
      incidentDate: new Date('2025-01-02'),
      description: 'Simple claim',
      amountClaimed: 5000,
      status: 'PENDING',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02')
    };

    expect(claim._id).toBe('claim2');
    expect(claim.userId).toBe('user2');
    expect(claim.userPolicyId).toBe('policy2');
    expect(claim.userPolicy).toBeUndefined();
    expect(claim.incidentDate).toBeInstanceOf(Date);
    expect(claim.description).toBe('Simple claim');
    expect(claim.amountClaimed).toBe(5000);
    expect(claim.status).toBe('PENDING');
    expect(claim.decisionNotes).toBeUndefined();
    expect(claim.decidedByAgentId).toBeUndefined();
    expect(claim.decidedByAgent).toBeUndefined();
    expect(claim.createdAt).toBeInstanceOf(Date);
    expect(claim.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle different claim statuses', () => {
    const statuses: Claim['status'][] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
    
    statuses.forEach(status => {
      const claim: Claim = {
        _id: 'claim1',
        userId: 'user1',
        userPolicyId: 'policy1',
        incidentDate: new Date(),
        description: 'Test claim',
        amountClaimed: 1000,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(claim.status).toBe(status);
    });
  });
});

describe('ClaimSubmissionRequest Interface', () => {
  it('should create a valid ClaimSubmissionRequest object', () => {
    const claimRequest: ClaimSubmissionRequest = {
      policyId: 'policy1',
      incidentDate: '2025-01-01',
      description: 'Medical emergency',
      amount: 10000,
      documents: []
    };

    expect(claimRequest.policyId).toBe('policy1');
    expect(claimRequest.incidentDate).toBe('2025-01-01');
    expect(claimRequest.description).toBe('Medical emergency');
    expect(claimRequest.amount).toBe(10000);
    expect(claimRequest.documents).toEqual([]);
  });

  it('should create ClaimSubmissionRequest without optional documents', () => {
    const claimRequest: ClaimSubmissionRequest = {
      policyId: 'policy1',
      incidentDate: '2025-01-01',
      description: 'Medical emergency',
      amount: 10000
    };

    expect(claimRequest.policyId).toBe('policy1');
    expect(claimRequest.incidentDate).toBe('2025-01-01');
    expect(claimRequest.description).toBe('Medical emergency');
    expect(claimRequest.amount).toBe(10000);
    expect(claimRequest.documents).toBeUndefined();
  });
});

describe('ClaimStatusUpdate Interface', () => {
  it('should create a valid ClaimStatusUpdate object', () => {
    const statusUpdate: ClaimStatusUpdate = {
      status: 'APPROVED',
      notes: 'Claim approved after review'
    };

    expect(statusUpdate.status).toBe('APPROVED');
    expect(statusUpdate.notes).toBe('Claim approved after review');
  });

  it('should create ClaimStatusUpdate without optional notes', () => {
    const statusUpdate: ClaimStatusUpdate = {
      status: 'REJECTED'
    };

    expect(statusUpdate.status).toBe('REJECTED');
    expect(statusUpdate.notes).toBeUndefined();
  });

  it('should handle different status values', () => {
    const statuses: ClaimStatusUpdate['status'][] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
    
    statuses.forEach(status => {
      const statusUpdate: ClaimStatusUpdate = {
        status
      };

      expect(statusUpdate.status).toBe(status);
    });
  });
});





