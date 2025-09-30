import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:5000/api/v1';
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    console.log('API Service - Setting token in localStorage');
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
    console.log('API Service - Token set successfully, current token:', this.getToken());
  }

  private removeToken(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Auth endpoints
  login(credentials: { email: string; password: string }): Observable<any> {
    console.log('API Service - Login request to:', `${this.baseUrl}/auth/login`);
    console.log('API Service - Credentials:', credentials);
    return this.http.post(`${this.baseUrl}/auth/login`, credentials)
      .pipe(tap((response: any) => {
        console.log('API Service - Login response:', response);
        if (response.token) {
          console.log('API Service - Storing token:', response.token);
          this.setToken(response.token);
        } else {
          console.warn('API Service - No token in response');
        }
      }));
  }

  register(userData: { name: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, { headers: this.getAuthHeaders() });
  }

  logout(): void {
    this.removeToken();
  }

  // Policy endpoints
  getPolicies(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/policies`, { params });
  }

  getPolicyById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/policies/${id}`);
  }

  purchasePolicy(policyId: string, purchaseData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/policies/${policyId}/purchase`, purchaseData, {
      headers: this.getAuthHeaders()
    });
  }

  getUserPolicies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/policies`, { headers: this.getAuthHeaders() });
  }

  cancelPolicy(policyId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/policies/${policyId}/cancel`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Claim endpoints
  submitClaim(claimData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/claims`, claimData, {
      headers: this.getAuthHeaders()
    });
  }

  getClaims(): Observable<any> {
    return this.http.get(`${this.baseUrl}/claims`, { headers: this.getAuthHeaders() });
  }

  getClaimById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/claims/${id}`, { headers: this.getAuthHeaders() });
  }

  updateClaimStatus(claimId: string, statusData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/claims/${claimId}/status`, statusData, {
      headers: this.getAuthHeaders()
    });
  }

  cancelClaim(claimId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/claims/${claimId}/cancel`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Payment endpoints
  recordPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments`, paymentData, {
      headers: this.getAuthHeaders()
    });
  }

  getUserPayments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/user`, { headers: this.getAuthHeaders() });
  }

  getPayments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments`, { headers: this.getAuthHeaders() });
  }

  // Agent endpoints
  getAgents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents`, { headers: this.getAuthHeaders() });
  }

  createAgent(agentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agents`, agentData, {
      headers: this.getAuthHeaders()
    });
  }

  assignAgent(agentId: string, assignmentData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/${agentId}/assign`, assignmentData, {
      headers: this.getAuthHeaders()
    });
  }

  // Dashboard endpoints
  getCustomerDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/me/dashboard`, { headers: this.getAuthHeaders() });
  }

  getUserDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/me/dashboard`, { headers: this.getAuthHeaders() });
  }

  getAgentDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents/dashboard`, { headers: this.getAuthHeaders() });
  }

  getAdminDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/me/dashboard`, { headers: this.getAuthHeaders() });
  }

  // Admin endpoints
  getAllAgents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/agents`, { headers: this.getAuthHeaders() });
  }

  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/customers`, { headers: this.getAuthHeaders() });
  }

  getAgentDetails(agentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/agents/${agentId}`, { headers: this.getAuthHeaders() });
  }

  getCustomerDetailsForAdmin(customerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/customers/${customerId}`, { headers: this.getAuthHeaders() });
  }

  getAuditLogs(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/admin/audit`, { 
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  // Agent-specific endpoints
  getAllAgentsForAgent(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/agents`, { headers: this.getAuthHeaders() });
  }

  getAgentClaims(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/agents/claims`, { 
      headers: this.getAuthHeaders(),
      params 
    });
  }

  updateAgentClaimStatus(claimId: string, statusData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agents/claims/${claimId}/status`, statusData, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerDetails(customerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents/customers/${customerId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  sendMessageToCustomer(customerId: string, messageData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agents/customers/${customerId}/message`, messageData, {
      headers: this.getAuthHeaders()
    });
  }

  getAgentPerformance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents/performance`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Admin endpoints

  getAdminSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/summary`, { headers: this.getAuthHeaders() });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/users`, { headers: this.getAuthHeaders() });
  }

  getMonthlyRevenue(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/revenue`, { headers: this.getAuthHeaders() });
  }

  createPolicy(policyData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/policies`, policyData, {
      headers: this.getAuthHeaders()
    });
  }

  // File upload
  uploadFile(file: File, endpoint: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });

    return this.http.post(`${this.baseUrl}/${endpoint}`, formData, { headers });
  }

  // Profile management
  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  uploadProfilePhoto(file: File): Observable<any> {
    return this.uploadFile(file, 'auth/profile-photo');
  }
}
