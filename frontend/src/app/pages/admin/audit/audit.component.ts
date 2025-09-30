import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { AuditLog } from '../../../models/audit.model';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {
  currentUser: any = null;
  auditLogs: AuditLog[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalLogs = 0;
  limit = 20;
  
  // Filters
  actionFilter = '';
  userIdFilter = '';
  startDate = '';
  endDate = '';
  
  // Available actions for filter
  availableActions = [
    'LOGIN',
    'LOGOUT', 
    'POLICY_CREATED',
    'POLICY_UPDATED',
    'CLAIM_CREATED',
    'CLAIM_UPDATED',
    'CLAIM_APPROVED',
    'CLAIM_REJECTED',
    'AGENT_ASSIGNED',
    'USER_CREATED',
    'USER_UPDATED',
    'PAYMENT_PROCESSED'
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: this.limit
    };
    
    if (this.actionFilter) params.action = this.actionFilter;
    if (this.userIdFilter) params.userId = this.userIdFilter;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;
    
    this.apiService.getAuditLogs(params).subscribe({
      next: (response: any) => {
        console.log('Audit logs loaded:', response);
        if (response.success && response.data) {
          this.auditLogs = response.data;
          this.totalPages = response.pagination?.pages || 1;
          this.totalLogs = response.pagination?.total || 0;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading audit logs:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.actionFilter = '';
    this.userIdFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAuditLogs();
    }
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'LOGIN': 'text-green-600 bg-green-100',
      'LOGOUT': 'text-gray-600 bg-gray-100',
      'POLICY_CREATED': 'text-blue-600 bg-blue-100',
      'POLICY_UPDATED': 'text-yellow-600 bg-yellow-100',
      'CLAIM_CREATED': 'text-purple-600 bg-purple-100',
      'CLAIM_UPDATED': 'text-orange-600 bg-orange-100',
      'CLAIM_APPROVED': 'text-green-600 bg-green-100',
      'CLAIM_REJECTED': 'text-red-600 bg-red-100',
      'AGENT_ASSIGNED': 'text-indigo-600 bg-indigo-100',
      'USER_CREATED': 'text-teal-600 bg-teal-100',
      'USER_UPDATED': 'text-cyan-600 bg-cyan-100',
      'PAYMENT_PROCESSED': 'text-emerald-600 bg-emerald-100'
    };
    return colors[action] || 'text-gray-600 bg-gray-100';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}


