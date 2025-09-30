import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MockDataService } from '../../services/mock-data.service';
import { ClaimStatusService } from '../../services/claim-status.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  currentUser: any = null;
  stats = {
    assignedPolicies: 0,
    pendingClaims: 0,
    totalCommissions: 0
  };
  assignedPolicies: any[] = [];
  pendingClaims: any[] = [];
  policies: any[] = [];
  otherAgents: any[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private mockDataService: MockDataService,
    private claimStatusService: ClaimStatusService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAgentData();
    this.loadPolicies();
    this.loadOtherAgents();
  }

  loadAgentData(): void {
    this.isLoading = true;
    
    // Load agent dashboard data
    this.apiService.getAgentDashboard().subscribe({
      next: (response) => {
        console.log('Agent dashboard response:', response);
        const data = response.data || response;
        // Use the proper stats object from backend
        this.stats = {
          assignedPolicies: data.stats?.assignedPolicies || 0,
          pendingClaims: data.stats?.pendingClaims || 0,
          totalCommissions: data.stats?.totalCommissions || 0
        };
        
        // Use the correct data arrays
        this.assignedPolicies = data.assignedPolicies || [];
        this.pendingClaims = data.assignedClaims || [];
        this.isLoading = false;
        console.log('Agent dashboard data loaded:', {
          stats: this.stats,
          pendingClaimsCount: this.pendingClaims.length,
          pendingClaims: this.pendingClaims.map(c => ({ id: c._id, status: c.status }))
        });
      },
      error: (error) => {
        console.error('Error loading agent dashboard, using mock data:', error);
        // Use mock data when API fails
        this.mockDataService.getMockAgentDashboard().subscribe({
          next: (response) => {
            const data = response.data || response;
            this.stats = {
              assignedPolicies: data.stats?.assignedPolicies || 0,
              pendingClaims: data.stats?.pendingClaims || 0,
              totalCommissions: data.stats?.totalCommissions || 0
            };
            
            this.assignedPolicies = data.assignedPolicies || [];
            this.pendingClaims = data.assignedClaims || [];
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadPolicies(): void {
    // Load all policies for agent overview
    this.apiService.getPolicies().subscribe({
      next: (response) => {
        this.policies = Array.isArray(response) ? response : (response.policies || []);
        console.log('Policies loaded:', this.policies.length);
      },
      error: (error) => {
        console.error('Error loading policies, using mock data:', error);
        // Use mock data when API fails
        this.mockDataService.getMockPolicies().subscribe({
          next: (policies) => {
            this.policies = policies;
            console.log('Mock policies loaded:', this.policies.length);
          }
        });
      }
    });
  }

  loadOtherAgents(): void {
    // Load other agents for agent to view
    this.apiService.getAllAgentsForAgent().subscribe({
      next: (response) => {
        console.log('Other agents loaded:', response);
        if (response.success && response.data) {
          // Filter out current agent
          this.otherAgents = response.data.filter((agent: any) => agent._id !== this.currentUser?._id);
        }
      },
      error: (error) => {
        console.error('Error loading other agents:', error);
        this.otherAgents = [];
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

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  updateClaimStatus(claimId: string, status: string, notes?: string): void {
    console.log('Updating claim status:', { claimId, status, notes });
    
    this.apiService.updateAgentClaimStatus(claimId, { status, notes }).subscribe({
      next: (response) => {
        console.log('Claim status updated successfully:', response);
        // Refresh the dashboard data
        this.loadAgentData();
        alert(`Claim ${status.toLowerCase()} successfully!`);
      },
      error: (error) => {
        console.error('Error updating claim status:', error);
        alert('Error updating claim status. Please try again.');
      }
    });
  }

  approveClaim(claimId: string): void {
    this.updateClaimStatus(claimId, 'APPROVED', 'Claim approved by agent');
  }

  rejectClaim(claimId: string): void {
    const notes = prompt('Please provide reason for rejection:');
    if (notes) {
      this.updateClaimStatus(claimId, 'REJECTED', notes);
    }
  }

  showPerformanceReports(): void {
    this.apiService.getAgentPerformance().subscribe({
      next: (response) => {
        const performanceData = response.data || response;
        const reportMessage = `
Performance Report:
• Total Customers: ${performanceData.totalCustomers}
• Claims Resolved (Last 30 days): ${performanceData.claimsResolved}
• Claims Pending: ${performanceData.claimsPending}
• Average Response Time: ${performanceData.averageResponseTime} hours
• Customer Satisfaction: ${performanceData.customerSatisfaction}/5
• Conversion Rate: ${performanceData.conversionRate}%
        `;
        alert(reportMessage);
      },
      error: (error) => {
        console.error('Error loading performance data, using mock data:', error);
        // Use mock data when API fails
        this.mockDataService.getMockAgentPerformance().subscribe({
          next: (response) => {
            const performanceData = response.data || response;
            const reportMessage = `
Performance Report:
• Total Customers: ${performanceData.totalCustomers}
• Claims Resolved (Last 30 days): ${performanceData.claimsResolved}
• Claims Pending: ${performanceData.claimsPending}
• Average Response Time: ${performanceData.averageResponseTime} hours
• Customer Satisfaction: ${performanceData.customerSatisfaction}/5
• Conversion Rate: ${performanceData.conversionRate}%
            `;
            alert(reportMessage);
          }
        });
      }
    });
  }
}
