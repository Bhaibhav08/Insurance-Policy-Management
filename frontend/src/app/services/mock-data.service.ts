import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  getMockAgentDashboard() {
    return of({
      success: true,
      data: {
        stats: {
          assignedPolicies: 0,
          pendingClaims: 0,
          totalCommissions: 0
        },
        assignedPolicies: [],
        assignedClaims: []
      }
    });
  }

  getMockAgentPerformance() {
    return of({
      success: true,
      data: {
        totalCustomers: 2,
        claimsResolved: 5,
        claimsPending: 2,
        averageResponseTime: 2.5,
        customerSatisfaction: 4.2,
        conversionRate: 85.5
      }
    });
  }

  getMockPolicies() {
    return of([
      {
        _id: '1',
        title: 'Health Insurance Premium',
        description: 'Comprehensive health coverage for individuals and families',
        category: 'Health',
        premium: 5000,
        minSumInsured: 500000,
        maxSumInsured: 1000000,
        termMonths: 12,
        code: 'HI001',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
      },
      {
        _id: '2',
        title: 'Life Insurance Basic',
        description: 'Term life insurance with flexible coverage options',
        category: 'Life',
        premium: 3000,
        minSumInsured: 1000000,
        maxSumInsured: 5000000,
        termMonths: 12,
        code: 'LI001',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
      },
      {
        _id: '3',
        title: 'Auto Insurance',
        description: 'Complete vehicle protection with roadside assistance',
        category: 'Auto',
        premium: 2500,
        minSumInsured: 200000,
        maxSumInsured: 1000000,
        termMonths: 12,
        code: 'AI001',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400'
      }
    ]);
  }

  getMockCustomerDashboard() {
    return of({
      success: true,
      data: {
        policies: [
          {
            _id: '1',
            policyProductId: {
              title: 'Health Insurance Premium',
              category: 'Health'
            },
            status: 'ACTIVE',
            premium: 5000,
            sumInsured: 500000,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '2',
            policyProductId: {
              title: 'Life Insurance Basic',
              category: 'Life'
            },
            status: 'ACTIVE',
            premium: 3000,
            sumInsured: 1000000,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        claims: [
          {
            _id: '1',
            amountClaimed: 25000,
            description: 'Medical emergency - hospitalization required',
            status: 'PENDING',
            incidentDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            amountClaimed: 15000,
            description: 'Vehicle accident - repair required',
            status: 'PENDING',
            incidentDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ],
        payments: [
          {
            _id: '1',
            amount: 5000,
            status: 'COMPLETED',
            dueDate: new Date().toISOString(),
            paidAt: new Date().toISOString()
          },
          {
            _id: '2',
            amount: 3000,
            status: 'COMPLETED',
            dueDate: new Date().toISOString(),
            paidAt: new Date().toISOString()
          }
        ],
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }

  getMockAdminDashboard() {
    return of({
      success: true,
      data: {
        stats: {
          totalUsers: 156,
          totalPolicies: 89,
          pendingClaims: 12,
          monthlyRevenue: 450000,
          totalAgents: 8,
          totalCustomers: 148,
          approvedClaims: 45,
          rejectedClaims: 7
        },
        policies: [
          {
            _id: '1',
            title: 'Health Insurance Premium',
            category: 'Health',
            premium: 5000,
            totalSold: 25,
            revenue: 125000
          },
          {
            _id: '2',
            title: 'Life Insurance Basic',
            category: 'Life',
            premium: 3000,
            totalSold: 18,
            revenue: 54000
          },
          {
            _id: '3',
            title: 'Auto Insurance',
            category: 'Auto',
            premium: 2500,
            totalSold: 32,
            revenue: 80000
          },
          {
            _id: '4',
            title: 'Home Insurance',
            category: 'Property',
            premium: 4000,
            totalSold: 14,
            revenue: 56000
          }
        ],
        recentUsers: [],
        recentClaims: [],
        monthlyRevenueData: [
          { month: 'Jan', revenue: 380000 },
          { month: 'Feb', revenue: 420000 },
          { month: 'Mar', revenue: 390000 },
          { month: 'Apr', revenue: 450000 },
          { month: 'May', revenue: 480000 },
          { month: 'Jun', revenue: 450000 }
        ]
      }
    });
  }
}
