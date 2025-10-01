import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PolicyProduct, PolicyPurchaseRequest } from '../../models/policy.model';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.css']
})
export class PolicyDetailComponent implements OnInit {
  policy: PolicyProduct | null = null;
  isLoading = true;
  showPurchaseForm = false;
  purchaseForm = {
    startDate: '',
    termMonths: 12,
    nominee: {
      name: '',
      relation: ''
    }
  };
  isPurchasing = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const policyId = this.route.snapshot.paramMap.get('id');
    if (policyId) {
      this.loadPolicy(policyId);
    }
  }

  loadPolicy(id: string): void {
    this.isLoading = true;
    
    // Try to fetch from API first
    this.apiService.getPolicyById(id).subscribe({
      next: (response) => {
        console.log('Policy API response:', response);
        if (response.success && response.data) {
          this.policy = response.data;
        } else {
          this.policy = null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching policy:', error);
        // Fallback to sample data
        this.loadSamplePolicy(id);
      }
    });
  }

  loadSamplePolicy(id: string): void {
    // Use sample data as fallback
    const samplePolicies = [
      {
        _id: '68db70d602c5325d38c03d3a',
        code: 'LIFE001',
        title: 'Term Life Insurance',
        description: 'Comprehensive life coverage with flexible premium options and high sum assured.',
        premium: 2500,
        termMonths: 240,
        minSumInsured: 1000000,
        maxSumInsured: 10000000,
        category: 'life',
        features: ['Death benefit', 'Accidental death benefit', 'Terminal illness benefit', 'Premium waiver'],
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
      },
      {
        _id: '68db70d602c5325d38c03d3b',
        code: 'HEALTH001',
        title: 'Health Insurance',
        description: 'Complete health coverage for your entire family with cashless treatment.',
        premium: 1800,
        termMonths: 12,
        minSumInsured: 500000,
        maxSumInsured: 5000000,
        category: 'health',
        features: ['Cashless treatment', 'Pre & post hospitalization', 'Maternity cover', 'Day care procedures'],
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
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
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
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
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
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
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'
      }
    ];
    
    const policy = samplePolicies.find(p => p._id === id);
    if (policy) {
      this.policy = policy;
    } else {
      this.policy = null;
    }
    this.isLoading = false;
  }

  onPurchaseClick(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showPurchaseForm = true;
  }

  onPurchaseSubmit(): void {
    if (!this.policy) return;

    this.isPurchasing = true;
    this.errorMessage = '';

    const purchaseData: PolicyPurchaseRequest = {
      startDate: this.purchaseForm.startDate,
      termMonths: this.purchaseForm.termMonths,
      nominee: this.purchaseForm.nominee
    };

    this.apiService.purchasePolicy(this.policy._id, purchaseData).subscribe({
      next: (response) => {
        this.isPurchasing = false;
        this.showPurchaseForm = false;
        // Show success message and redirect
        alert('Policy purchased successfully! Redirecting to payment...');
        this.processPayment(response);
      },
      error: (error) => {
        this.isPurchasing = false;
        this.errorMessage = error.error?.message || 'Purchase failed. Please try again.';
      }
    });
  }

  processPayment(policyData: any): void {
    // Simulate payment processing
    const paymentData = {
      policyId: policyData._id,
      amount: this.policy?.premium || 0,
      method: 'SIMULATED',
      reference: 'PAY_' + Date.now()
    };

    this.apiService.recordPayment(paymentData).subscribe({
      next: (paymentResponse) => {
        alert('Payment processed successfully! Policy is now active.');
        this.router.navigate(['/my-policies']);
      },
      error: (error) => {
        console.error('Payment error:', error);
        alert('Policy purchased but payment failed. Please contact support.');
        this.router.navigate(['/my-policies']);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
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
}
