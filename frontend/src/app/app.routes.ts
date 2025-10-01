import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'policies',
    loadComponent: () => import('./pages/policies/policies.component').then(m => m.PoliciesComponent)
  },
  {
    path: 'policy/:id',
    loadComponent: () => import('./pages/policy-detail/policy-detail.component').then(m => m.PolicyDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'my-policies',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer', 'agent', 'admin'] },
    loadComponent: () => import('./pages/my-policies/my-policies.component').then(m => m.MyPoliciesComponent)
  },
  {
    path: 'claims',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer', 'agent', 'admin'] },
    loadComponent: () => import('./pages/claims/claims.component').then(m => m.ClaimsComponent)
  },
  {
    path: 'payments',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['customer', 'agent', 'admin'] },
    loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'agent-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['agent', 'admin'] },
    loadComponent: () => import('./pages/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent)
  },
      {
        path: 'agent/customer/:id',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['agent', 'admin'] },
        loadComponent: () => import('./pages/agent/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'agent/profile/:id',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['agent', 'admin'] },
        loadComponent: () => import('./pages/agent/agent-profile/agent-profile.component').then(m => m.AgentProfileComponent)
      },
  {
    path: 'admin-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'admin/audit',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin/audit/audit.component').then(m => m.AuditComponent)
  },
  {
    path: 'admin/create-policy',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin/create-policy/create-policy.component').then(m => m.CreatePolicyComponent)
  },
  {
    path: 'admin/policies',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin/policies/policies.component').then(m => m.PoliciesComponent)
  },
  {
    path: 'admin/agent-detail/:id',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin/agent-detail/agent-detail.component').then(m => m.AgentDetailComponent)
  },
  {
    path: 'admin/customer-detail/:id',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
