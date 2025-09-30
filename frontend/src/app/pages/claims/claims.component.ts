import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Claim, ClaimSubmissionRequest } from '../../models/claim.model';
import { UserPolicy } from '../../models/policy.model';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css']
})
export class ClaimsComponent implements OnInit {
  claims: Claim[] = [];
  userPolicies: UserPolicy[] = [];
  isLoading = true;
  showClaimForm = false;
  isSubmittingClaim = false;
  claimForm: ClaimSubmissionRequest = {
    policyId: '',
    incidentDate: '',
    description: '',
    amount: 0,
    documents: []
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
    this.loadUserPolicies();
  }

  refreshPolicies(): void {
    this.loadUserPolicies();
  }

  loadClaims(): void {
    this.isLoading = true;
    this.apiService.getClaims().subscribe({
      next: (response) => {
        this.claims = Array.isArray(response) ? response : (response.data || []);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.claims = [];
        this.isLoading = false;
      }
    });
  }

  loadUserPolicies(): void {
    this.apiService.getUserPolicies().subscribe({
      next: (response) => {
        console.log('User policies response:', response);
        const policies = Array.isArray(response) ? response : (response.data || []);
        this.userPolicies = policies.filter((p: any) => p.status === 'ACTIVE');
        console.log('Active policies for claims:', this.userPolicies);
        console.log('Policy details:', this.userPolicies.map(p => ({
          id: p._id,
          title: p.policyProduct?.title,
          code: p.policyProduct?.code,
          status: p.status
        })));
      },
      error: (error) => {
        console.error('Error loading user policies:', error);
        this.userPolicies = [];
      }
    });
  }

  onNewClaimClick(): void {
    if (this.userPolicies.length === 0) {
      alert('You need to have an active policy to file a claim. Please purchase a policy first from the Policies page.');
      return;
    }
    this.showClaimForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onClaimSubmit(): void {
    if (!this.claimForm.policyId || !this.claimForm.incidentDate || !this.claimForm.description || !this.claimForm.amount) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmittingClaim = true;
    this.errorMessage = '';

    // Convert the form data to match the backend API
    const claimData = {
      policyId: this.claimForm.policyId,
      incidentDate: this.claimForm.incidentDate,
      description: this.claimForm.description,
      amount: this.claimForm.amount
    };

    this.apiService.submitClaim(claimData).subscribe({
      next: (response) => {
        this.isSubmittingClaim = false;
        this.successMessage = 'Claim submitted successfully!';
        this.showClaimForm = false;
        this.resetClaimForm();
        this.loadClaims(); // Refresh claims list
      },
      error: (error) => {
        this.isSubmittingClaim = false;
        this.errorMessage = error.error?.message || 'Failed to submit claim. Please try again.';
      }
    });
  }

  resetClaimForm(): void {
    this.claimForm = {
      policyId: '',
      incidentDate: '',
      description: '',
      amount: 0,
      documents: []
    };
  }

  onCancelClaim(): void {
    this.showClaimForm = false;
    this.resetClaimForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'APPROVED': 'text-green-600 bg-green-100',
      'REJECTED': 'text-red-600 bg-red-100',
      'CANCELLED': 'text-gray-600 bg-gray-100'
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

  cancelClaim(claimId: string): void {
    if (confirm('Are you sure you want to cancel this claim? This action cannot be undone.')) {
      this.apiService.cancelClaim(claimId).subscribe({
        next: (response) => {
          console.log('Claim cancelled successfully:', response);
          this.successMessage = 'Claim cancelled successfully';
          this.errorMessage = '';
          this.loadClaims(); // Refresh claims list
        },
        error: (error) => {
          console.error('Error cancelling claim:', error);
          this.errorMessage = error.error?.message || 'Failed to cancel claim. Please try again.';
          this.successMessage = '';
        }
      });
    }
  }
}
