export interface Payment {
  _id: string;
  userId: string;
  userPolicyId: string;
  policyId?: string; // Add policyId for backward compatibility
  userPolicy?: {
    _id: string;
    policyProduct: {
      title: string;
      code: string;
    };
  };
  amount: number;
  method: 'CARD' | 'NETBANKING' | 'OFFLINE' | 'SIMULATED' | 'UPI'; // Add UPI method
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: Date;
}

export interface PaymentRequest {
  policyId: string;
  amount: number;
  method: 'CARD' | 'NETBANKING' | 'OFFLINE' | 'SIMULATED';
  reference: string;
}

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'NETBANKING' | 'OFFLINE';
  name: string;
  description: string;
  icon: string;
}
