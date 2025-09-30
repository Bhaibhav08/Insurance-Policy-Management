export interface PolicyProduct {
  _id: string;
  code: string;
  title: string;
  description: string;
  premium: number;
  termMonths: number;
  minSumInsured: number;
  maxSumInsured: number; // Add missing property
  imageUrl?: string;
  category: string;
  features: string[];
  createdAt: Date;
}

export interface UserPolicy {
  _id: string;
  userId: string;
  policyProductId: string;
  policyProduct?: PolicyProduct;
  startDate: Date;
  endDate: Date;
  premiumPaid: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  assignedAgentId?: string;
  assignedAgent?: {
    _id: string;
    name: string;
    email: string;
  };
  nominee: {
    name: string;
    relation: string;
  };
  createdAt: Date;
}

export interface PolicyPurchaseRequest {
  startDate: string;
  termMonths: number;
  nominee: {
    name: string;
    relation: string;
  };
}

export interface PolicySearchFilters {
  category?: string;
  minPremium?: number;
  maxPremium?: number;
  termMonths?: number;
  searchTerm?: string;
}
