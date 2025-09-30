import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.apiService.getUserPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'SUCCESS': 'text-green-600 bg-green-100',
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'FAILED': 'text-red-600 bg-red-100'
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
}
