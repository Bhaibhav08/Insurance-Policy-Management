import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { MockDataService } from '../../services/mock-data.service';
import { ClaimStatusService } from '../../services/claim-status.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  stats = {
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
    totalPayments: 0,
    nextPaymentDue: null as Date | null
  };
  recentPolicies: any[] = [];
  recentClaims: any[] = [];
  isLoading = true;
  private claimStatusSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private mockDataService: MockDataService,
    private claimStatusService: ClaimStatusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Dashboard - Current user:', this.currentUser);
    this.loadDashboardData();
    
    // Listen for claim status updates from agent dashboard
    this.claimStatusSubscription = this.claimStatusService.claimStatusUpdates$.subscribe(updates => {
      this.updateClaimStatuses(updates);
    });
  }

  ngOnDestroy(): void {
    if (this.claimStatusSubscription) {
      this.claimStatusSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    console.log('Dashboard - Loading data from API...');
    
    // Load customer dashboard data from API
    this.apiService.getCustomerDashboard().subscribe({
      next: (response) => {
        console.log('Dashboard - API response:', response);
        const data = response.data || response;
        
        // Set policies data
        this.recentPolicies = data.recentPolicies || [];
        this.stats.totalPolicies = data.summary?.totalPolicies || data.stats?.totalPolicies || 0;
        this.stats.activePolicies = data.summary?.activePolicies || data.stats?.activePolicies || 0;
        
        // Set claims data
        this.recentClaims = data.recentClaims || [];
        this.stats.totalClaims = data.summary?.totalClaims || data.stats?.totalClaims || 0;
        this.stats.pendingClaims = data.summary?.pendingClaims || data.stats?.pendingClaims || 0;
        
        // Set payments data
        this.stats.totalPayments = data.summary?.totalPayments || data.stats?.totalPayments || 0;
        this.stats.nextPaymentDue = data.summary?.nextPaymentDue || data.stats?.nextPaymentDue || null;
        
        this.isLoading = false;
        console.log('Dashboard - Real data loaded:', {
          stats: this.stats,
          policiesCount: this.recentPolicies.length,
          claimsCount: this.recentClaims.length,
          claims: this.recentClaims.map(c => ({ id: c._id, status: c.status, amount: c.amountClaimed }))
        });
      },
      error: (error) => {
        console.error('Error loading dashboard data, using mock data:', error);
        // Fallback to mock data if API fails
        this.mockDataService.getMockCustomerDashboard().subscribe({
          next: (response) => {
            const data = response.data || response;
            console.log('Dashboard - Mock data loaded as fallback:', data);
            
            // Set policies data
            this.recentPolicies = data.policies || [];
            this.stats.totalPolicies = this.recentPolicies.length;
            this.stats.activePolicies = this.recentPolicies.filter((p: any) => p.status === 'ACTIVE').length;
            
            // Set claims data
            this.recentClaims = data.claims || [];
            this.stats.totalClaims = this.recentClaims.length;
            this.stats.pendingClaims = this.recentClaims.filter((c: any) => c.status === 'PENDING').length;
            
            // Set payments data
            this.stats.totalPayments = data.payments?.length || 0;
            this.stats.nextPaymentDue = data.nextPaymentDue ? new Date(data.nextPaymentDue) : null;
            
            this.isLoading = false;
          },
          error: (mockError) => {
            console.error('Error loading mock data:', mockError);
            this.recentPolicies = [];
            this.recentClaims = [];
            this.stats = {
              totalPolicies: 0,
              activePolicies: 0,
              totalClaims: 0,
              pendingClaims: 0,
              totalPayments: 0,
              nextPaymentDue: null
            };
            this.isLoading = false;
          }
        });
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': 'text-green-600 bg-green-100',
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'EXPIRED': 'text-gray-600 bg-gray-100',
      'APPROVED': 'text-green-600 bg-green-100',
      'REJECTED': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Update claim statuses when agent makes changes
  private updateClaimStatuses(updates: any[]): void {
    console.log('Dashboard - Received claim status updates:', updates);
    
    updates.forEach(update => {
      const claimIndex = this.recentClaims.findIndex(claim => claim._id === update.claimId);
      if (claimIndex !== -1) {
        // Update the claim status
        this.recentClaims[claimIndex].status = update.status;
        this.recentClaims[claimIndex].decisionNotes = update.notes;
        this.recentClaims[claimIndex].decidedAt = update.decidedAt;
        
        // Update stats
        this.stats.totalClaims = this.recentClaims.length;
        this.stats.pendingClaims = this.recentClaims.filter((c: any) => c.status === 'PENDING').length;
        
        console.log(`Dashboard - Updated claim ${update.claimId} status to ${update.status}`);
      }
    });
  }

  // Navigation methods for testing
  viewAllPolicies(): void {
    this.router.navigate(['/policies']);
  }

  viewAllClaims(): void {
    this.router.navigate(['/claims']);
  }

  viewAllPayments(): void {
    this.router.navigate(['/payments']);
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }
}
