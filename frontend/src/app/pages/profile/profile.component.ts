import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isSaving = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.previewUrl = user.profilePhoto || null;
      }
    });
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.currentUser?.name,
      email: this.currentUser?.email
    });
    this.selectedFile = null;
    this.previewUrl = this.currentUser?.profilePhoto || null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSave(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      // Update profile
      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: (response) => {
          // Upload photo if selected
          if (this.selectedFile) {
            this.authService.uploadProfilePhoto(this.selectedFile).subscribe({
              next: () => {
                this.isSaving = false;
                this.isEditing = false;
                this.selectedFile = null;
              },
              error: (error) => {
                console.error('Error uploading photo:', error);
                this.isSaving = false;
              }
            });
          } else {
            this.isSaving = false;
            this.isEditing = false;
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isSaving = false;
        }
      });
    }
  }
}
