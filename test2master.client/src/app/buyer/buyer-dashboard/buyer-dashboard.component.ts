import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service'; // Fixed casing
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router, RouterModule } from '@angular/router'; // Import Router and RouterModule

interface UserProfile {
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
}
@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css'
})
export class BuyerDashboardComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  submitted = false;
  passwordSubmitted = false;
  successMessage = '';
  passwordSuccessMessage = '';
  errorMessage = '';

  // Mock user data - in a real app this would come from a service
  userData: UserProfile = {
    username: 'user123',
    email: 'user@example.com',
    phone: '0123456789',
    firstName: 'محمد',
    lastName: 'أحمد',
    address: 'شارع الملك حسين، عمّان',
    city: 'عمّان',
    country: 'الأردن'
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: [''],
      city: [''],
      country: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user data into the form
    this.profileForm.patchValue(this.userData);
  }

  // Convenience getter for easy access to form fields
  get f() { return this.profileForm.controls; }
  get p() { return this.passwordForm.controls; }

  // Custom validator to check if password and confirmPassword match
  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    // In a real app, you would update the profile with a server
    console.log('Profile update data:', this.profileForm.getRawValue());

    // Simulate successful update
    setTimeout(() => {
      this.successMessage = 'تم تحديث البيانات الشخصية بنجاح';
      this.submitted = false;
    }, 1000);
  }

  onPasswordSubmit() {
    this.passwordSubmitted = true;
    this.passwordSuccessMessage = '';
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.passwordForm.invalid) {
      return;
    }

    // In a real app, you would update the password with a server
    console.log('Password update attempt:', this.passwordForm.value);

    // Simulate successful update
    setTimeout(() => {
      this.passwordSuccessMessage = 'تم تغيير كلمة المرور بنجاح';
      this.passwordForm.reset();
      this.passwordSubmitted = false;
    }, 1000);
  }

  logout() {
    // Clear local storage and navigate to login
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
