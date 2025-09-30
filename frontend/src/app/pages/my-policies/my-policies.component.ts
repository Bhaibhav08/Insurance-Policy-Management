import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UserPolicy } from '../../models/policy.model';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-policies.component.html',
  styleUrls: ['./my-policies.component.css']
})
export class MyPoliciesComponent implements OnInit {
  policies: UserPolicy[] = [];
  isLoading = true;
  isCancelling = false;
  cancelMessage = '';
  cancelError = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading = true;
    this.apiService.getUserPolicies().subscribe({
      next: (response) => {
        console.log('User policies response:', response);
        // Handle both direct array response and wrapped response
        this.policies = Array.isArray(response) ? response : (response.data || []);
        this.isLoading = false;
        console.log('Loaded policies:', this.policies);
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.isLoading = false;
        // Show empty state or error message
        this.policies = [];
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': 'text-green-600 bg-green-100',
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'EXPIRED': 'text-gray-600 bg-gray-100'
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

  cancelPolicy(policy: UserPolicy): void {
    // Check if policy can be cancelled (within 15 days)
    const policyDate = new Date(policy.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - policyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 15) {
      this.cancelError = 'Policy cannot be cancelled after 15 days of purchase.';
      this.cancelMessage = '';
      return;
    }

    if (policy.status !== 'ACTIVE') {
      this.cancelError = 'Only active policies can be cancelled.';
      this.cancelMessage = '';
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to cancel this policy?\n\n` +
      `Policy: ${policy.policyProduct?.title || 'Policy'}\n` +
      `Premium: ${this.formatCurrency(policy.premiumPaid)}\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.isCancelling = true;
    this.cancelError = '';
    this.cancelMessage = '';

    this.apiService.cancelPolicy(policy._id).subscribe({
      next: (response) => {
        console.log('Policy cancellation response:', response);
        this.isCancelling = false;
        this.cancelMessage = 'Policy cancelled successfully!';
        this.cancelError = '';
        
        // Reload policies to reflect the change
        this.loadPolicies();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.cancelMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error cancelling policy:', error);
        this.isCancelling = false;
        this.cancelError = error.error?.message || 'Failed to cancel policy. Please try again.';
        this.cancelMessage = '';
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.cancelError = '';
        }, 5000);
      }
    });
  }

  canCancelPolicy(policy: UserPolicy): boolean {
    if (policy.status !== 'ACTIVE') {
      return false;
    }
    
    const policyDate = new Date(policy.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - policyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 15;
  }
}
