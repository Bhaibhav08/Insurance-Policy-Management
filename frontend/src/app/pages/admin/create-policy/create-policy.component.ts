import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-create-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-policy.component.html',
  styleUrls: ['./create-policy.component.css']
})
export class CreatePolicyComponent implements OnInit {
  policyForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.policyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      premium: [0, [Validators.required, Validators.min(1)]],
      termMonths: [12, [Validators.required, Validators.min(1)]],
      minSumInsured: [0, [Validators.required, Validators.min(1)]],
      category: ['', [Validators.required]],
      features: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.policyForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.policyForm.value;
      // Convert features string to array
      formData.features = (formData.features && typeof formData.features === 'string') ? formData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) : [];

      this.apiService.createPolicy(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = 'Policy created successfully!';
          this.policyForm.reset();
          this.policyForm.patchValue({
            termMonths: 12,
            premium: 0,
            minSumInsured: 0
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Failed to create policy. Please try again.';
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}














