import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  currentUser: any = null;
  agents: any[] = [];
  customers: any[] = [];
  isLoading = true;
  activeTab = 'agents';
  searchTerm = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadAgents();
    this.loadCustomers();
  }

  loadAgents(): void {
    this.apiService.getAllAgents().subscribe({
      next: (response: any) => {
        console.log('Agents loaded:', response);
        if (response.success && response.data) {
          this.agents = response.data;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading agents:', error);
        this.isLoading = false;
      }
    });
  }

  loadCustomers(): void {
    this.apiService.getAllCustomers().subscribe({
      next: (response: any) => {
        console.log('Customers loaded:', response);
        if (response.success && response.data) {
          this.customers = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading customers:', error);
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
      'verified': 'text-green-600 bg-green-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getFilteredAgents(): any[] {
    if (!this.searchTerm) return this.agents;
    return this.agents.filter(agent => 
      agent.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getFilteredCustomers(): any[] {
    if (!this.searchTerm) return this.customers;
    return this.customers.filter(customer => 
      customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}


