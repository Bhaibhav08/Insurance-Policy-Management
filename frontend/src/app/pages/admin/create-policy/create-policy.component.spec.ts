import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CreatePolicyComponent } from './create-policy.component';
import { ApiService } from '../../../services/api.service';

describe('CreatePolicyComponent', () => {
  let component: CreatePolicyComponent;
  let fixture: ComponentFixture<CreatePolicyComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockPolicyResponse = {
    success: true,
    data: { _id: 'policy1', title: 'Test Policy' }
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['createPolicy']);

    await TestBed.configureTestingModule({
      imports: [CreatePolicyComponent, ReactiveFormsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePolicyComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    // Reset all spies before each test
    apiService.createPolicy.calls.reset();
    
    apiService.createPolicy.and.returnValue(of(mockPolicyResponse));
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create and initialize form with validation', () => {
    expect(component).toBeTruthy();
    expect(component.isSubmitting).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');

    const form = component.policyForm;
    
    // Test initial validation state
    expect(form.get('code')?.hasError('required')).toBeTruthy();
    expect(form.get('title')?.hasError('required')).toBeTruthy();
    expect(form.get('description')?.hasError('required')).toBeTruthy();
    expect(form.get('premium')?.hasError('min')).toBeTruthy();
    expect(form.get('termMonths')?.valid).toBeTruthy();
    expect(form.get('minSumInsured')?.hasError('min')).toBeTruthy();
    expect(form.get('category')?.hasError('required')).toBeTruthy();

    // Test field validation
    const codeControl = form.get('code');
    codeControl?.setValue('AB');
    expect(codeControl?.hasError('minlength')).toBeTruthy();
    codeControl?.setValue('ABC');
    expect(codeControl?.valid).toBeTruthy();

    const titleControl = form.get('title');
    titleControl?.setValue('Test');
    expect(titleControl?.hasError('minlength')).toBeTruthy();
    titleControl?.setValue('Test Policy');
    expect(titleControl?.valid).toBeTruthy();

    const descriptionControl = form.get('description');
    descriptionControl?.setValue('Short');
    expect(descriptionControl?.hasError('minlength')).toBeTruthy();
    descriptionControl?.setValue('This is a detailed description of the policy');
    expect(descriptionControl?.valid).toBeTruthy();

    const premiumControl = form.get('premium');
    premiumControl?.setValue(0);
    expect(premiumControl?.hasError('min')).toBeTruthy();
    premiumControl?.setValue(1000);
    expect(premiumControl?.valid).toBeTruthy();

    const termMonthsControl = form.get('termMonths');
    termMonthsControl?.setValue(0);
    expect(termMonthsControl?.hasError('min')).toBeTruthy();
    termMonthsControl?.setValue(12);
    expect(termMonthsControl?.valid).toBeTruthy();

    const minSumInsuredControl = form.get('minSumInsured');
    minSumInsuredControl?.setValue(0);
    expect(minSumInsuredControl?.hasError('min')).toBeTruthy();
    minSumInsuredControl?.setValue(100000);
    expect(minSumInsuredControl?.valid).toBeTruthy();
  });

  it('should handle form submission, validation, and error handling', () => {
    // Test valid form submission
    component.policyForm.patchValue({
      code: 'TEST001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 100000,
      category: 'life',
      features: 'Feature 1, Feature 2, Feature 3'
    });

    expect(component.policyForm.valid).toBe(true);
    component.onSubmit();

    expect(apiService.createPolicy).toHaveBeenCalledWith({
      code: 'TEST001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 100000,
      category: 'life',
      features: ['Feature 1', 'Feature 2', 'Feature 3']
    });
    expect(component.isSubmitting).toBe(false);
    expect(component.successMessage).toBe('Policy created successfully!');
    expect(component.errorMessage).toBe('');

    // Test invalid form submission
    component.policyForm.patchValue({
      code: '',
      title: '',
      description: '',
      premium: 0,
      termMonths: 0,
      minSumInsured: 0,
      category: ''
    });

    expect(component.policyForm.valid).toBe(false);
    apiService.createPolicy.calls.reset(); // Reset spy calls
    component.onSubmit();
    expect(apiService.createPolicy).not.toHaveBeenCalled();

    // Test error handling with message
    const errorResponse = { error: { message: 'Policy creation failed' } };
    apiService.createPolicy.and.returnValue(throwError(() => errorResponse));
    
    component.policyForm.patchValue({
      code: 'TEST001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 100000,
      category: 'life',
      features: 'Feature 1, Feature 2'
    });

    expect(component.policyForm.valid).toBe(true);
    component.onSubmit();
    expect(component.isSubmitting).toBe(false);
    expect(component.errorMessage).toBe('Policy creation failed');
    expect(component.successMessage).toBe('');

    // Test error handling without message
    const errorResponseNoMessage = { error: {} };
    apiService.createPolicy.and.returnValue(throwError(() => errorResponseNoMessage));
    component.onSubmit();
    expect(component.errorMessage).toBe('Failed to create policy. Please try again.');

    // Test features processing
    apiService.createPolicy.calls.reset(); // Reset spy calls
    component.policyForm.reset(); // Reset form first
    component.policyForm.patchValue({
      code: 'TEST001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 100000,
      category: 'life',
      features: ' Feature 1 , Feature 2 , Feature 3 '
    });

    expect(component.policyForm.valid).toBe(true);
    component.onSubmit();
    expect(apiService.createPolicy).toHaveBeenCalledWith(jasmine.objectContaining({
      features: ['Feature 1', 'Feature 2', 'Feature 3']
    }));

    // Test empty features string
    component.policyForm.patchValue({
      code: 'TEST001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 5000,
      termMonths: 12,
      minSumInsured: 100000,
      category: 'life',
      features: ''
    });

    expect(component.policyForm.valid).toBe(true);
    component.onSubmit();
    expect(apiService.createPolicy).toHaveBeenCalledWith(jasmine.objectContaining({
      features: []
    }));

    // Test currency formatting
    const formatted = component.formatCurrency(5000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('5,000');
  });
});