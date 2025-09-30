import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  customerId: string = '';
  customer: any = null;
  policies: any[] = [];
  claims: any[] = [];
  messages: any[] = [];
  statistics: any = {};
  isLoading = true;
  activeTab = 'profile';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.customerId) {
      this.loadCustomerDetails();
    }
  }

  loadCustomerDetails(): void {
    this.isLoading = true;
    this.apiService.getCustomerDetails(this.customerId).subscribe({
      next: (response) => {
        console.log('Customer details response:', response);
        if (response.success && response.data) {
          this.customer = response.data.customer;
          this.policies = response.data.policies || [];
          this.claims = response.data.claims || [];
          this.messages = response.data.messages || [];
          this.statistics = response.data.statistics || {};
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
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
      'REJECTED': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getRelationshipLabel(relationship: string): string {
    const relationships: { [key: string]: string } = {
      'spouse': 'Spouse',
      'child': 'Child',
      'parent': 'Parent',
      'sibling': 'Sibling',
      'other': 'Other'
    };
    return relationships[relationship] || relationship;
  }

  getGenderLabel(gender: string): string {
    const genders: { [key: string]: string } = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer_not_to_say': 'Prefer not to say'
    };
    return genders[gender] || gender;
  }

  getMaritalStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'single': 'Single',
      'married': 'Married',
      'divorced': 'Divorced',
      'widowed': 'Widowed',
      'separated': 'Separated'
    };
    return statuses[status] || status;
  }
}









