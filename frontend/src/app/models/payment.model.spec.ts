import { Payment, PaymentRequest, PaymentMethod } from './payment.model';

describe('Payment Interface', () => {
  it('should create a valid Payment object', () => {
    const payment: Payment = {
      _id: 'payment1',
      userId: 'user1',
      userPolicyId: 'policy1',
      userPolicy: {
        _id: 'policy1',
        policyProduct: {
          title: 'Health Insurance',
          code: 'HI001'
        }
      },
      amount: 5000,
      method: 'CARD',
      reference: 'TXN123456',
      status: 'SUCCESS',
      createdAt: new Date('2025-01-01')
    };

    expect(payment._id).toBe('payment1');
    expect(payment.userId).toBe('user1');
    expect(payment.userPolicyId).toBe('policy1');
    expect(payment.userPolicy?._id).toBe('policy1');
    expect(payment.userPolicy?.policyProduct.title).toBe('Health Insurance');
    expect(payment.amount).toBe(5000);
    expect(payment.method).toBe('CARD');
    expect(payment.reference).toBe('TXN123456');
    expect(payment.status).toBe('SUCCESS');
    expect(payment.createdAt).toBeInstanceOf(Date);
  });

  it('should create Payment without optional userPolicy', () => {
    const payment: Payment = {
      _id: 'payment2',
      userId: 'user2',
      userPolicyId: 'policy2',
      amount: 3000,
      method: 'NETBANKING',
      reference: 'TXN123457',
      status: 'PENDING',
      createdAt: new Date('2025-01-02')
    };

    expect(payment._id).toBe('payment2');
    expect(payment.userId).toBe('user2');
    expect(payment.userPolicyId).toBe('policy2');
    expect(payment.userPolicy).toBeUndefined();
    expect(payment.amount).toBe(3000);
    expect(payment.method).toBe('NETBANKING');
    expect(payment.reference).toBe('TXN123457');
    expect(payment.status).toBe('PENDING');
    expect(payment.createdAt).toBeInstanceOf(Date);
  });

  it('should handle different payment methods and statuses', () => {
    const methods: Payment['method'][] = ['CARD', 'NETBANKING', 'OFFLINE', 'SIMULATED'];
    const statuses: Payment['status'][] = ['PENDING', 'SUCCESS', 'FAILED'];
    
    methods.forEach(method => {
      const payment: Payment = {
        _id: 'payment1',
        userId: 'user1',
        userPolicyId: 'policy1',
        amount: 1000,
        method,
        reference: 'TXN123456',
        status: 'SUCCESS',
        createdAt: new Date()
      };

      expect(payment.method).toBe(method);
    });

    statuses.forEach(status => {
      const payment: Payment = {
        _id: 'payment1',
        userId: 'user1',
        userPolicyId: 'policy1',
        amount: 1000,
        method: 'CARD',
        reference: 'TXN123456',
        status,
        createdAt: new Date()
      };

      expect(payment.status).toBe(status);
    });
  });
});

describe('PaymentRequest Interface', () => {
  it('should create a valid PaymentRequest object', () => {
    const paymentRequest: PaymentRequest = {
      policyId: 'policy1',
      amount: 5000,
      method: 'CARD',
      reference: 'TXN123456'
    };

    expect(paymentRequest.policyId).toBe('policy1');
    expect(paymentRequest.amount).toBe(5000);
    expect(paymentRequest.method).toBe('CARD');
    expect(paymentRequest.reference).toBe('TXN123456');
  });

  it('should handle different payment methods', () => {
    const methods: PaymentRequest['method'][] = ['CARD', 'NETBANKING', 'OFFLINE', 'SIMULATED'];
    
    methods.forEach(method => {
      const paymentRequest: PaymentRequest = {
        policyId: 'policy1',
        amount: 1000,
        method,
        reference: 'TXN123456'
      };

      expect(paymentRequest.method).toBe(method);
    });
  });
});

describe('PaymentMethod Interface', () => {
  it('should create a valid PaymentMethod object', () => {
    const paymentMethod: PaymentMethod = {
      id: 'card1',
      type: 'CARD',
      name: 'Credit Card',
      description: 'Pay with your credit card',
      icon: 'credit-card'
    };

    expect(paymentMethod.id).toBe('card1');
    expect(paymentMethod.type).toBe('CARD');
    expect(paymentMethod.name).toBe('Credit Card');
    expect(paymentMethod.description).toBe('Pay with your credit card');
    expect(paymentMethod.icon).toBe('credit-card');
  });

  it('should handle different payment method types', () => {
    const types: PaymentMethod['type'][] = ['CARD', 'NETBANKING', 'OFFLINE'];
    
    types.forEach(type => {
      const paymentMethod: PaymentMethod = {
        id: 'method1',
        type,
        name: 'Test Method',
        description: 'Test description',
        icon: 'test-icon'
      };

      expect(paymentMethod.type).toBe(type);
    });
  });
});





