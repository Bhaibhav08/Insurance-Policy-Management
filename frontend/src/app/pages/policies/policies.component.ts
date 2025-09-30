import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PolicyProduct, PolicySearchFilters } from '../../models/policy.model';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './policies.component.html',
})
export class PoliciesComponent implements OnInit {
  policies: PolicyProduct[] = [];
  displayedPolicies: PolicyProduct[] = [];
  isLoading = false;
  searchTerm = '';
  currentUser: any = null;
  showPurchaseModal = false;
  selectedPolicy: PolicyProduct | null = null;
  purchaseData = {
    startDate: '',
    termMonths: 12,
    nominee: {
      name: '',
      relation: ''
    },
    paymentMethod: 'credit_card'
  };
  
  // Payment flow states
  paymentStep: 'form' | 'confirmation' | 'processing' | 'success' | 'error' = 'form';
  paymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  };
  paymentError = '';

  // Sample policies data (15-20 policies)
  samplePolicies: PolicyProduct[] = [
    {
      _id: '1',
      code: 'LIFE001',
      title: 'Term Life Insurance',
      description: 'Comprehensive life coverage with flexible premium options and high sum assured.',
      premium: 2500,
      termMonths: 240,
      minSumInsured: 1000000,
      maxSumInsured: 10000000,
      category: 'life',
      features: ['Death benefit', 'Accidental death benefit', 'Terminal illness benefit', 'Premium waiver'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
    },
    {
      _id: '2',
      code: 'HEALTH001',
      title: 'Family Health Insurance',
      description: 'Complete health coverage for your entire family with cashless treatment.',
      premium: 1800,
      termMonths: 12,
      minSumInsured: 500000,
      maxSumInsured: 5000000,
      category: 'health',
      features: ['Cashless treatment', 'Pre & post hospitalization', 'Maternity cover', 'Day care procedures'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
    },
    {
      _id: '3',
      code: 'AUTO001',
      title: 'Comprehensive Auto Insurance',
      description: 'Complete protection for your vehicle with third-party and own damage coverage.',
      premium: 12000,
      termMonths: 12,
      minSumInsured: 800000,
      maxSumInsured: 8000000,
      category: 'auto',
      features: ['Third-party liability', 'Own damage cover', 'Zero depreciation', 'Engine protection'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    },
    {
      _id: '4',
      code: 'HOME001',
      title: 'Home Insurance',
      description: 'Protect your home and belongings against natural disasters and theft.',
      premium: 3500,
      termMonths: 12,
      minSumInsured: 2000000,
      maxSumInsured: 20000000,
      category: 'home',
      features: ['Natural disaster cover', 'Theft protection', 'Fire damage', 'Burglary cover'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
    },
    {
      _id: '5',
      code: 'TRAVEL001',
      title: 'International Travel Insurance',
      description: 'Comprehensive travel protection for your international trips.',
      premium: 2500,
      termMonths: 1,
      minSumInsured: 100000,
      maxSumInsured: 1000000,
      category: 'travel',
      features: ['Medical emergency', 'Trip cancellation', 'Baggage loss', 'Flight delay'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'
    },
    {
      _id: '6',
      code: 'LIFE002',
      title: 'Whole Life Insurance',
      description: 'Lifetime coverage with savings component and guaranteed returns.',
      premium: 5000,
      termMonths: 480,
      minSumInsured: 2000000,
      maxSumInsured: 20000000,
      category: 'life',
      features: ['Lifetime coverage', 'Savings component', 'Guaranteed returns', 'Loan facility'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    },
    {
      _id: '7',
      code: 'HEALTH002',
      title: 'Senior Citizen Health Plan',
      description: 'Specialized health coverage for senior citizens with pre-existing conditions.',
      premium: 3500,
      termMonths: 12,
      minSumInsured: 300000,
      maxSumInsured: 3000000,
      category: 'health',
      features: ['Pre-existing conditions', 'No medical test', 'Cashless treatment', 'Domiciliary treatment'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
    },
    {
      _id: '8',
      code: 'AUTO002',
      title: 'Two-Wheeler Insurance',
      description: 'Complete protection for your two-wheeler with affordable premiums.',
      premium: 2500,
      termMonths: 12,
      minSumInsured: 150000,
      maxSumInsured: 1500000,
      category: 'auto',
      features: ['Third-party liability', 'Own damage cover', 'Personal accident', 'Accessories cover'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    },
    {
      _id: '9',
      code: 'HOME002',
      title: 'Renters Insurance',
      description: 'Protect your rented property and belongings with comprehensive coverage.',
      premium: 1500,
      termMonths: 12,
      minSumInsured: 500000,
      maxSumInsured: 5000000,
      category: 'home',
      features: ['Personal belongings', 'Liability coverage', 'Additional living expenses', 'Theft protection'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
    },
    {
      _id: '10',
      code: 'TRAVEL002',
      title: 'Domestic Travel Insurance',
      description: 'Essential travel protection for your domestic trips within India.',
      premium: 500,
      termMonths: 1,
      minSumInsured: 50000,
      maxSumInsured: 500000,
      category: 'travel',
      features: ['Medical emergency', 'Trip cancellation', 'Baggage loss', 'Personal accident'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
    },
    {
      _id: '11',
      code: 'LIFE003',
      title: 'Child Education Plan',
      description: 'Secure your child\'s future with education-focused life insurance.',
      premium: 3000,
      termMonths: 180,
      minSumInsured: 1000000,
      maxSumInsured: 10000000,
      category: 'life',
      features: ['Education fund', 'Death benefit', 'Maturity benefit', 'Premium waiver'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
    },
    {
      _id: '12',
      code: 'HEALTH003',
      title: 'Critical Illness Insurance',
      description: 'Financial protection against critical illnesses with lump sum payout.',
      premium: 2000,
      termMonths: 240,
      minSumInsured: 500000,
      maxSumInsured: 5000000,
      category: 'health',
      features: ['Critical illness cover', 'Lump sum payout', 'No medical test', 'Survival period'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba0ef541?w=400&h=300&fit=crop'
    },
    {
      _id: '13',
      code: 'AUTO003',
      title: 'Commercial Vehicle Insurance',
      description: 'Comprehensive coverage for commercial vehicles and business use.',
      premium: 15000,
      termMonths: 12,
      minSumInsured: 1000000,
      maxSumInsured: 10000000,
      category: 'auto',
      features: ['Third-party liability', 'Own damage cover', 'Driver coverage', 'Loading/unloading'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop'
    },
    {
      _id: '14',
      code: 'HOME003',
      title: 'Property Insurance',
      description: 'Protect your commercial and residential properties against various risks.',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 5000000,
      maxSumInsured: 50000000,
      category: 'home',
      features: ['Fire damage', 'Natural disasters', 'Theft protection', 'Rent loss'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
    },
    {
      _id: '15',
      code: 'TRAVEL003',
      title: 'Annual Travel Insurance',
      description: 'Year-round travel protection for frequent travelers.',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 200000,
      maxSumInsured: 2000000,
      category: 'travel',
      features: ['Multiple trips', 'Medical emergency', 'Trip cancellation', 'Baggage loss'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'
    },
    {
      _id: '16',
      code: 'LIFE004',
      title: 'Retirement Plan',
      description: 'Secure your retirement with guaranteed income and life coverage.',
      premium: 4000,
      termMonths: 300,
      minSumInsured: 1500000,
      maxSumInsured: 15000000,
      category: 'life',
      features: ['Retirement income', 'Death benefit', 'Guaranteed returns', 'Tax benefits'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    },
    {
      _id: '17',
      code: 'HEALTH004',
      title: 'Maternity Insurance',
      description: 'Comprehensive maternity coverage for expecting mothers.',
      premium: 2800,
      termMonths: 12,
      minSumInsured: 300000,
      maxSumInsured: 3000000,
      category: 'health',
      features: ['Maternity expenses', 'Newborn cover', 'Pre-natal care', 'Post-natal care'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
    },
    {
      _id: '18',
      code: 'AUTO004',
      title: 'Electric Vehicle Insurance',
      description: 'Specialized coverage for electric vehicles with battery protection.',
      premium: 8000,
      termMonths: 12,
      minSumInsured: 600000,
      maxSumInsured: 6000000,
      category: 'auto',
      features: ['Battery cover', 'Third-party liability', 'Own damage', 'Charging station damage'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop'
    },
    {
      _id: '19',
      code: 'HOME004',
      title: 'Jewellery Insurance',
      description: 'Protect your valuable jewellery and precious items.',
      premium: 2000,
      termMonths: 12,
      minSumInsured: 1000000,
      maxSumInsured: 10000000,
      category: 'home',
      features: ['Theft protection', 'Mysterious disappearance', 'Damage cover', 'Worldwide coverage'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop'
    },
    {
      _id: '20',
      code: 'TRAVEL004',
      title: 'Adventure Sports Insurance',
      description: 'Specialized coverage for adventure sports and high-risk activities.',
      premium: 1500,
      termMonths: 1,
      minSumInsured: 300000,
      maxSumInsured: 3000000,
      category: 'travel',
      features: ['Adventure sports', 'High altitude', 'Water sports', 'Emergency evacuation'],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'
    }
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading = true;
    
    this.apiService.getPolicies().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.policies = Array.isArray(response) ? response : (response.data || []);
        this.displayedPolicies = [...this.policies];
        this.isLoading = false;
        console.log('Loaded policies:', this.policies.length);
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.isLoading = false;
        // Fallback to sample data if API fails
        this.policies = [...this.samplePolicies];
        this.displayedPolicies = [...this.policies];
        console.log('Using fallback data:', this.policies.length);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.displayedPolicies = this.policies.filter(policy => {
      const matchesSearch = !this.searchTerm || 
        policy.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        policy.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        policy.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  openPurchaseModal(policy: PolicyProduct): void {
    console.log('Opening purchase modal for policy:', policy);
    this.selectedPolicy = policy;
    this.purchaseData = {
      startDate: new Date().toISOString().split('T')[0],
      termMonths: policy.termMonths,
      nominee: {
        name: '',
        relation: ''
      },
      paymentMethod: 'credit_card'
    };
    this.paymentStep = 'form';
    this.paymentError = '';
    this.paymentDetails = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    };
    this.showPurchaseModal = true;
    console.log('Modal opened with data:', this.purchaseData);
  }

  closePurchaseModal(): void {
    this.showPurchaseModal = false;
    this.selectedPolicy = null;
    this.paymentStep = 'form';
    this.paymentError = '';
  }

  proceedToPayment(): void {
    console.log('Proceed to payment called', this.purchaseData);
    
    // Validate form
    if (!this.purchaseData.startDate || !this.purchaseData.nominee.name || !this.purchaseData.nominee.relation) {
      this.paymentError = 'Please fill in all required fields';
      this.paymentStep = 'form'; // Stay on form when validation fails
      console.log('Validation failed:', {
        startDate: this.purchaseData.startDate,
        nomineeName: this.purchaseData.nominee.name,
        nomineeRelation: this.purchaseData.nominee.relation
      });
      return;
    }
    
    this.paymentStep = 'confirmation';
    this.paymentError = '';
    console.log('Moving to confirmation step');
  }

  confirmPayment(): void {
    console.log('Confirm payment called');
    this.paymentStep = 'processing';
    this.paymentError = '';
    
    // Call the real API to purchase policy
    this.purchasePolicy();
  }

  retryPayment(): void {
    this.paymentStep = 'form';
    this.paymentError = '';
  }

  backToEdit(): void {
    this.paymentStep = 'form';
    this.paymentError = '';
  }

  purchasePolicy(): void {
    if (!this.selectedPolicy || !this.currentUser) {
      this.paymentError = 'Missing policy or user information';
      this.paymentStep = 'error';
      return;
    }

    // Create UserPolicy data based on backend model
    const purchaseRequest = {
      startDate: this.purchaseData.startDate,
      termMonths: this.purchaseData.termMonths,
      nominee: this.purchaseData.nominee,
      paymentMethod: this.purchaseData.paymentMethod
    };

    this.apiService.purchasePolicy(this.selectedPolicy._id, purchaseRequest).subscribe({
      next: (response) => {
        console.log('Policy purchase successful:', response);
        this.paymentStep = 'success';
        // Close modal after 3 seconds
        setTimeout(() => {
          this.closePurchaseModal();
        }, 3000);
      },
      error: (error) => {
        console.error('Error purchasing policy:', error);
        this.paymentError = error.error?.message || 'Error purchasing policy. Please try again.';
        this.paymentStep = 'error';
      }
    });
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'life': '👨‍👩‍👧‍👦',
      'health': '🏥',
      'auto': '🚗',
      'home': '🏠',
      'travel': '✈️',
      'default': '🛡️'
    };
    return icons[category] || icons['default'];
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'life': 'bg-blue-500',
      'health': 'bg-green-500',
      'auto': 'bg-red-500',
      'home': 'bg-purple-500',
      'travel': 'bg-yellow-500',
      'default': 'bg-gray-500'
    };
    return colors[category] || colors['default'];
  }

  getCategoryGradient(category: string): string {
    const gradients: { [key: string]: string } = {
      'life': 'from-blue-500 to-blue-600',
      'health': 'from-green-500 to-green-600',
      'auto': 'from-red-500 to-red-600',
      'home': 'from-purple-500 to-purple-600',
      'travel': 'from-yellow-500 to-yellow-600',
      'default': 'from-gray-500 to-gray-600'
    };
    return gradients[category] || gradients['default'];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getPremiumFrequency(premium: number, termMonths: number): string {
    if (termMonths <= 12) {
      return `₹${premium.toLocaleString()}/year`;
    } else {
      const monthlyPremium = Math.round(premium / 12);
      return `₹${monthlyPremium.toLocaleString()}/month`;
    }
  }

  getCurrentTimestamp(): number {
    return Date.now();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
}
