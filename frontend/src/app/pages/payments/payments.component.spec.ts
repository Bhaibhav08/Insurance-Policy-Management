import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentsComponent } from './payments.component';
import { ApiService } from '../../services/api.service';
import { Payment } from '../../models/payment.model';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockPayments: Payment[] = [
    {
      _id: '1',
      userId: 'user1',
      userPolicyId: 'policy1',
      policyId: 'policy1',
      amount: 5000,
      method: 'CARD',
      status: 'SUCCESS',
      reference: 'TXN123456',
      createdAt: new Date('2025-01-01'),
    },
    {
      _id: '2',
      userId: 'user1',
      userPolicyId: 'policy2',
      policyId: 'policy2',
      amount: 3000,
      method: 'UPI',
      status: 'PENDING',
      reference: 'TXN123457',
      createdAt: new Date('2025-01-02'),
    },
    {
      _id: '3',
      userId: 'user1',
      userPolicyId: 'policy3',
      policyId: 'policy3',
      amount: 2000,
      method: 'NETBANKING',
      status: 'FAILED',
      reference: 'TXN123458',
      createdAt: new Date('2025-01-03'),
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getUserPayments']);

    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    apiService.getUserPayments.and.returnValue(of(mockPayments));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.payments).toEqual([]);
    expect(component.isLoading).toBe(true);
  });

  it('should load payments on init', () => {
    component.ngOnInit();

    expect(apiService.getUserPayments).toHaveBeenCalled();
  });

  it('should load payments successfully', () => {
    component.loadPayments();

    expect(component.payments).toEqual(mockPayments);
    expect(component.isLoading).toBe(false);
  });

  it('should handle API error', () => {
    apiService.getUserPayments.and.returnValue(throwError(() => new Error('API Error')));

    component.loadPayments();

    expect(component.isLoading).toBe(false);
  });

  it('should return correct status colors', () => {
    expect(component.getStatusColor('SUCCESS')).toBe('text-green-600 bg-green-100');
    expect(component.getStatusColor('PENDING')).toBe('text-yellow-600 bg-yellow-100');
    expect(component.getStatusColor('FAILED')).toBe('text-red-600 bg-red-100');
    expect(component.getStatusColor('UNKNOWN')).toBe('text-gray-600 bg-gray-100');
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(5000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('5,000');
  });

  it('should format date correctly', () => {
    const date = new Date('2025-01-01');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2025');
  });

  it('should handle empty payments array', () => {
    apiService.getUserPayments.and.returnValue(of([]));

    component.loadPayments();

    expect(component.payments).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should display payment method correctly', () => {
    component.payments = mockPayments;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('CARD');
    expect(compiled.textContent).toContain('UPI');
    expect(compiled.textContent).toContain('NETBANKING');
  });

  it('should display transaction IDs correctly', () => {
    component.payments = mockPayments;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('TXN123456');
    expect(compiled.textContent).toContain('TXN123457');
    expect(compiled.textContent).toContain('TXN123458');
  });

  it('should show loading state initially', () => {
    // Test the component's initial state before ngOnInit is called
    expect(component.isLoading).toBe(true);
    expect(component.payments).toEqual([]);
  });

  it('should show payments when loaded', () => {
    component.payments = mockPayments;
    component.isLoading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Payments');
  });

  it('should handle null response', () => {
    apiService.getUserPayments.and.returnValue(of(null as any));

    component.loadPayments();

    expect(component.payments).toBeNull();
    expect(component.isLoading).toBe(false);
  });

  it('should handle undefined response', () => {
    apiService.getUserPayments.and.returnValue(of(undefined as any));

    component.loadPayments();

    expect(component.payments).toBeUndefined();
    expect(component.isLoading).toBe(false);
  });
});

