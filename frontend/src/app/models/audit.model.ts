export interface AuditLog {
  _id: string;
  action: string;
  actorId: string;
  actor?: {
    _id: string;
    name: string;
    email: string;
  };
  details: Record<string, any>;
  ip: string;
  timestamp: Date;
}

export interface AdminSummary {
  totalUsers: number;
  totalPolicies: number;
  totalClaims: number;
  pendingClaims: number;
  totalPayments: number;
  monthlyRevenue: number;
  activeAgents: number;
}
