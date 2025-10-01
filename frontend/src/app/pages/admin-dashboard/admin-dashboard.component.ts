import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any = null;
  stats = {
    totalUsers: 0,
    totalPolicies: 0,
    pendingClaims: 0,
    monthlyRevenue: 0,
    totalAgents: 0,
    totalCustomers: 0,
    approvedClaims: 0,
    rejectedClaims: 0
  };
  policies: any[] = [];
  recentUsers: any[] = [];
  recentClaims: any[] = [];
  agents: any[] = [];
  customers: any[] = [];
  monthlyRevenueData: any[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.isLoading = true;
    console.log('Loading admin dashboard with real backend data...');
    
    // Load admin summary data
    this.apiService.getAdminSummary().subscribe({
      next: (response) => {
        console.log('Admin summary data loaded:', response);
        
        if (response.success) {
          // Set stats from admin summary response
          this.stats = {
            totalUsers: response.totalUsers || 0,
            totalPolicies: response.totalPolicies || 0,
            pendingClaims: response.pendingClaims || 0,
            monthlyRevenue: response.monthlyRevenue || 0,
            totalAgents: response.totalAgents || 0,
            totalCustomers: response.totalCustomers || 0,
            approvedClaims: response.approvedClaims || 0,
            rejectedClaims: response.rejectedClaims || 0
          };
        }
        
        this.isLoading = false;
        console.log('Admin dashboard stats updated:', this.stats);
      },
      error: (error) => {
        console.error('Error loading admin summary:', error);
        this.isLoading = false;
      }
    });

    // Load additional data
    this.loadPolicies();
    this.loadAgentsAndCustomers();
    this.loadMonthlyRevenue();
    this.loadRecentUsersAndClaims();
  }

  loadRecentUsersAndClaims(): void {
    // Load recent users
    this.apiService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentUsers = response.data.slice(0, 5); // Show latest 5 users
        }
      },
      error: (error) => {
        console.error('Error loading recent users:', error);
      }
    });

    // Load recent claims
    this.apiService.getClaims().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentClaims = response.data.slice(0, 5); // Show latest 5 claims
        }
      },
      error: (error) => {
        console.error('Error loading recent claims:', error);
      }
    });
  }

  loadPolicies(): void {
    this.apiService.getPolicies().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.policies = response.data;
          console.log('Policies loaded:', this.policies.length);
        } else {
          this.policies = [];
        }
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.policies = [];
      }
    });
  }

  loadAgentsAndCustomers(): void {
    // Load agents
    this.apiService.getAllAgents().subscribe({
      next: (response) => {
        console.log('Agents loaded for admin dashboard:', response);
        if (response.success && response.data) {
          // Store agents for potential use in dashboard
          this.agents = response.data.slice(0, 4); // Show top 4 agents
        }
      },
      error: (error) => {
        console.error('Error loading agents:', error);
      }
    });

    // Load customers
    this.apiService.getAllCustomers().subscribe({
      next: (response) => {
        console.log('Customers loaded for admin dashboard:', response);
        if (response.success && response.data) {
          // Store customers for potential use in dashboard
          this.customers = response.data.slice(0, 4); // Show top 4 customers
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  loadMonthlyRevenue(): void {
    this.apiService.getMonthlyRevenue().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.monthlyRevenueData = response.data;
          console.log('Monthly revenue data loaded:', this.monthlyRevenueData.length);
        }
      },
      error: (error) => {
        console.error('Error loading monthly revenue data:', error);
        this.monthlyRevenueData = []; // Set empty array if no data available
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

  // Helper method for template calculations
  calculatePercentage(value: number): number {
    return Math.min(value * 4, 100);
  }

  deletePolicy(policyId: string, policyTitle: string): void {
    if (confirm(`Are you sure you want to delete the policy "${policyTitle}"? This action cannot be undone.`)) {
      this.apiService.deletePolicy(policyId).subscribe({
        next: (response) => {
          console.log('Policy deleted successfully:', response);
          this.loadPolicies(); // Reload the policies list
        },
        error: (error) => {
          console.error('Error deleting policy:', error);
          alert('Failed to delete policy: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }
}
