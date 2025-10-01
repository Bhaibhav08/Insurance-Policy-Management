import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.css']
})
export class PoliciesComponent implements OnInit {
  policies: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  currentUser: any = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Filters
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';

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
    this.errorMessage = '';

    const filters: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }
    if (this.categoryFilter) {
      filters.category = this.categoryFilter;
    }

    this.apiService.getPolicies(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.policies = response.data;
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.pages || 0;
        } else {
          this.errorMessage = 'Failed to load policies';
          this.policies = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load policies';
        this.policies = [];
      }
    });
  }

  deletePolicy(policyId: string, policyTitle: string): void {
    if (confirm(`Are you sure you want to delete the policy "${policyTitle}"? This action cannot be undone.`)) {
      this.apiService.deletePolicy(policyId).subscribe({
        next: (response) => {
          this.successMessage = 'Policy deleted successfully';
          this.loadPolicies(); // Reload the list
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete policy';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPolicies();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPolicies();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPolicies();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getCategoryOptions(): string[] {
    return ['health', 'car', 'home', 'travel', 'life', 'business'];
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}
