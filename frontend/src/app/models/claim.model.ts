export interface Claim {
  _id: string;
  userId: string;
  userPolicyId: string;
  policyId?: string; // Add policyId for backward compatibility
  userPolicy?: {
    _id: string;
    policyProductId: string;
    policyProduct?: {
      _id: string;
      title: string;
      code: string;
    };
  };
  incidentDate: Date;
  description: string;
  amountClaimed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  decisionNotes?: string;
  decidedByAgentId?: string;
  decidedByAgent?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimSubmissionRequest {
  policyId: string;
  incidentDate: string;
  description: string;
  amount: number;
  documents?: File[];
}

export interface ClaimStatusUpdate {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
}