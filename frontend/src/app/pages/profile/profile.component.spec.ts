import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    profilePhoto: 'https://example.com/photo.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['updateProfile', 'uploadProfilePhoto'], {
      currentUser$: of(mockUser)
    });

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    authService.updateProfile.and.returnValue(of({ success: true, data: mockUser }));
    authService.uploadProfilePhoto.and.returnValue(of({ success: true, data: { profilePhoto: 'new-photo.jpg' } }));
    fixture.detectChanges();
  });

  it('should create, initialize, and load user data', () => {
    // Initial state
    expect(component).toBeTruthy();
    expect(component.currentUser).toEqual(mockUser);
    expect(component.profileForm).toBeDefined();
    expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
    expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
    expect(component.isEditing).toBe(false);
    expect(component.isSaving).toBe(false);
    expect(component.selectedFile).toBeNull();
    expect(component.previewUrl).toBe(mockUser.profilePhoto || null);

    // Test form initialization with user data
    component.ngOnInit();
    expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
    expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
  });

  it('should handle editing, saving, and file operations', () => {
    // Test edit mode
    component.onEdit();
    expect(component.isEditing).toBe(true);

    // Test cancel editing
    component.onCancel();
    expect(component.isEditing).toBe(false);
    expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
    expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
    expect(component.selectedFile).toBeNull();
    expect(component.previewUrl).toBe(mockUser.profilePhoto || null);

    // Test file selection
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = { target: { files: [mockFile] } } as any;
    component.onFileSelected(mockEvent);
    expect(component.selectedFile).toBe(mockFile);

    // Test save with valid form
    component.profileForm.patchValue({ name: 'Updated Name', email: 'updated@example.com' });
    component.onSave();
    expect(authService.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name', email: 'updated@example.com' });
    expect(component.isSaving).toBe(false);
    expect(component.isEditing).toBe(false);
    expect(component.selectedFile).toBeNull();

    // Test save with photo upload
    component.selectedFile = mockFile;
    component.onSave();
    expect(authService.uploadProfilePhoto).toHaveBeenCalledWith(mockFile);

    // Test save error
    authService.updateProfile.and.returnValue(throwError(() => new Error('Update failed')));
    component.onSave();
    expect(component.isSaving).toBe(false);
  });

  it('should handle form validation and utility functions', () => {
    // Test form validation
    component.profileForm.patchValue({ name: '', email: '' });
    expect(component.profileForm.invalid).toBe(true);
    expect(component.profileForm.get('name')?.errors?.['required']).toBeTruthy();
    expect(component.profileForm.get('email')?.errors?.['required']).toBeTruthy();

    // Test email validation
    component.profileForm.patchValue({ email: 'invalid-email' });
    expect(component.profileForm.get('email')?.errors?.['email']).toBeTruthy();

    component.profileForm.patchValue({ email: 'valid@example.com' });
    expect(component.profileForm.get('email')?.errors?.['email']).toBeFalsy();

    // Test name minimum length validation
    component.profileForm.patchValue({ name: 'A' });
    expect(component.profileForm.get('name')?.errors?.['minlength']).toBeTruthy();

    component.profileForm.patchValue({ name: 'Valid Name' });
    expect(component.profileForm.get('name')?.errors?.['minlength']).toBeFalsy();

    // Test valid form
    component.profileForm.patchValue({ 
      name: 'Valid Name', 
      email: 'valid@example.com' 
    });
    expect(component.profileForm.valid).toBe(true);
  });
});