import { PolicyProduct, UserPolicy, PolicyPurchaseRequest, PolicySearchFilters } from './policy.model';

describe('PolicyProduct Interface', () => {
  it('should create valid PolicyProduct objects and handle different scenarios', () => {
    const policyProduct: PolicyProduct = {
      _id: 'policy1',
      code: 'LIFE001',
      title: 'Term Life Insurance',
      description: 'Comprehensive life coverage with flexible premium options',
      premium: 2500,
      termMonths: 240,
      minSumInsured: 1000000,
      maxSumInsured: 10000000,
      imageUrl: 'https://example.com/image.jpg',
      category: 'life',
      features: ['Death benefit', 'Accidental death benefit', 'Terminal illness benefit'],
      createdAt: new Date('2025-01-01')
    };

    expect(policyProduct._id).toBe('policy1');
    expect(policyProduct.code).toBe('LIFE001');
    expect(policyProduct.title).toBe('Term Life Insurance');
    expect(policyProduct.description).toBe('Comprehensive life coverage with flexible premium options');
    expect(policyProduct.premium).toBe(2500);
    expect(policyProduct.termMonths).toBe(240);
    expect(policyProduct.minSumInsured).toBe(1000000);
    expect(policyProduct.imageUrl).toBe('https://example.com/image.jpg');
    expect(policyProduct.category).toBe('life');
    expect(policyProduct.features).toEqual(['Death benefit', 'Accidental death benefit', 'Terminal illness benefit']);
    expect(policyProduct.createdAt).toBeInstanceOf(Date);

    // Test without optional imageUrl
    const policyProductNoImage: PolicyProduct = {
      _id: 'policy2',
      code: 'HEALTH001',
      title: 'Health Insurance',
      description: 'Health coverage for medical expenses',
      premium: 1800,
      termMonths: 12,
      minSumInsured: 500000,
      maxSumInsured: 5000000,
      category: 'health',
      features: ['Cashless treatment', 'Pre & post hospitalization'],
      createdAt: new Date('2025-01-01')
    };

    expect(policyProductNoImage._id).toBe('policy2');
    expect(policyProductNoImage.code).toBe('HEALTH001');
    expect(policyProductNoImage.title).toBe('Health Insurance');
    expect(policyProductNoImage.imageUrl).toBeUndefined();
    expect(policyProductNoImage.category).toBe('health');
    expect(policyProductNoImage.features).toEqual(['Cashless treatment', 'Pre & post hospitalization']);

    // Test different categories
    const categories = ['life', 'health', 'auto', 'home', 'travel'];
    categories.forEach(category => {
      const policyProduct: PolicyProduct = {
        _id: 'policy1',
        code: 'TEST001',
        title: 'Test Policy',
        description: 'Test description',
        premium: 1000,
        termMonths: 12,
        minSumInsured: 100000,
        maxSumInsured: 1000000,
        category,
        features: ['Feature 1'],
        createdAt: new Date()
      };
      expect(policyProduct.category).toBe(category);
    });
  });
});

describe('UserPolicy Interface', () => {
  it('should create valid UserPolicy objects and handle different scenarios', () => {
    const userPolicy: UserPolicy = {
      _id: 'userPolicy1',
      userId: 'user1',
      policyProductId: 'policy1',
      policyProduct: {
        _id: 'policy1',
        code: 'LIFE001',
        title: 'Term Life Insurance',
        description: 'Life coverage',
        premium: 2500,
        termMonths: 240,
        minSumInsured: 1000000,
        maxSumInsured: 10000000,
        category: 'life',
        features: ['Death benefit'],
        createdAt: new Date()
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
      premiumPaid: 2500,
      status: 'ACTIVE',
      assignedAgentId: 'agent1',
      assignedAgent: {
        _id: 'agent1',
        name: 'Agent Smith',
        email: 'agent@example.com'
      },
      nominee: {
        name: 'John Doe',
        relation: 'spouse'
      },
      createdAt: new Date('2025-01-01')
    };

    expect(userPolicy._id).toBe('userPolicy1');
    expect(userPolicy.userId).toBe('user1');
    expect(userPolicy.policyProductId).toBe('policy1');
    expect(userPolicy.policyProduct?._id).toBe('policy1');
    expect(userPolicy.startDate).toBeInstanceOf(Date);
    expect(userPolicy.endDate).toBeInstanceOf(Date);
    expect(userPolicy.premiumPaid).toBe(2500);
    expect(userPolicy.status).toBe('ACTIVE');
    expect(userPolicy.assignedAgentId).toBe('agent1');
    expect(userPolicy.assignedAgent?.name).toBe('Agent Smith');
    expect(userPolicy.nominee.name).toBe('John Doe');
    expect(userPolicy.nominee.relation).toBe('spouse');
    expect(userPolicy.createdAt).toBeInstanceOf(Date);

    // Test without optional fields
    const userPolicyMinimal: UserPolicy = {
      _id: 'userPolicy2',
      userId: 'user2',
      policyProductId: 'policy2',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
      premiumPaid: 1800,
      status: 'ACTIVE',
      nominee: {
        name: 'Jane Doe',
        relation: 'daughter'
      },
      createdAt: new Date('2025-01-01')
    };

    expect(userPolicyMinimal._id).toBe('userPolicy2');
    expect(userPolicyMinimal.userId).toBe('user2');
    expect(userPolicyMinimal.policyProductId).toBe('policy2');
    expect(userPolicyMinimal.policyProduct).toBeUndefined();
    expect(userPolicyMinimal.status).toBe('ACTIVE');
    expect(userPolicyMinimal.assignedAgentId).toBeUndefined();
    expect(userPolicyMinimal.assignedAgent).toBeUndefined();
    expect(userPolicyMinimal.nominee.name).toBe('Jane Doe');
    expect(userPolicyMinimal.nominee.relation).toBe('daughter');

    // Test different statuses
    const statuses: UserPolicy['status'][] = ['ACTIVE', 'CANCELLED', 'EXPIRED'];
    statuses.forEach(status => {
      const userPolicy: UserPolicy = {
        _id: 'userPolicy1',
        userId: 'user1',
        policyProductId: 'policy1',
        startDate: new Date(),
        endDate: new Date(),
        premiumPaid: 1000,
        status,
        nominee: {
          name: 'Test Nominee',
          relation: 'spouse'
        },
        createdAt: new Date()
      };
      expect(userPolicy.status).toBe(status);
    });
  });
});

describe('PolicyPurchaseRequest and PolicySearchFilters Interfaces', () => {
  it('should create valid PolicyPurchaseRequest and PolicySearchFilters objects', () => {
    // Test PolicyPurchaseRequest
    const purchaseRequest: PolicyPurchaseRequest = {
      startDate: '2025-01-01',
      termMonths: 12,
      nominee: {
        name: 'John Doe',
        relation: 'spouse'
      }
    };

    expect(purchaseRequest.startDate).toBe('2025-01-01');
    expect(purchaseRequest.termMonths).toBe(12);
    expect(purchaseRequest.nominee.name).toBe('John Doe');
    expect(purchaseRequest.nominee.relation).toBe('spouse');

    // Test PolicySearchFilters with all fields
    const filters: PolicySearchFilters = {
      category: 'life',
      minPremium: 1000,
      maxPremium: 5000,
      termMonths: 12,
      searchTerm: 'life insurance'
    };

    expect(filters.category).toBe('life');
    expect(filters.minPremium).toBe(1000);
    expect(filters.maxPremium).toBe(5000);
    expect(filters.termMonths).toBe(12);
    expect(filters.searchTerm).toBe('life insurance');

    // Test PolicySearchFilters with partial fields
    const partialFilters: PolicySearchFilters = {
      category: 'health',
      searchTerm: 'health insurance'
    };

    expect(partialFilters.category).toBe('health');
    expect(partialFilters.searchTerm).toBe('health insurance');
    expect(partialFilters.minPremium).toBeUndefined();
    expect(partialFilters.maxPremium).toBeUndefined();
    expect(partialFilters.termMonths).toBeUndefined();

    // Test empty PolicySearchFilters
    const emptyFilters: PolicySearchFilters = {};

    expect(emptyFilters.category).toBeUndefined();
    expect(emptyFilters.minPremium).toBeUndefined();
    expect(emptyFilters.maxPremium).toBeUndefined();
    expect(emptyFilters.termMonths).toBeUndefined();
    expect(emptyFilters.searchTerm).toBeUndefined();
  });
});