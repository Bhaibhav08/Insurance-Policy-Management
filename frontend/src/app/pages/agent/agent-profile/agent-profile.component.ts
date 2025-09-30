import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-profile.component.html',
  styleUrls: ['./agent-profile.component.css']
})
export class AgentProfileComponent implements OnInit {
  agentId: string = '';
  agent: any = null;
  assignedCustomers: any[] = [];
  assignedPolicies: any[] = [];
  claims: any[] = [];
  statistics: any = {};
  isLoading = true;
  activeTab = 'overview';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.agentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.agentId) {
      this.loadAgentDetails();
    }
  }

  loadAgentDetails(): void {
    this.isLoading = true;
    this.apiService.getAgentDetails(this.agentId).subscribe({
      next: (response: any) => {
        console.log('Agent details response:', response);
        if (response.success && response.data) {
          this.agent = response.data.agent;
          this.assignedCustomers = response.data.assignedCustomers || [];
          this.assignedPolicies = response.data.assignedPolicies || [];
          this.claims = response.data.claims || [];
          this.statistics = response.data.statistics || {};
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading agent details:', error);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
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

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': 'text-green-600 bg-green-100',
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'EXPIRED': 'text-gray-600 bg-gray-100',
      'APPROVED': 'text-green-600 bg-green-100',
      'REJECTED': 'text-red-600 bg-red-100',
      'verified': 'text-green-600 bg-green-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }
}








