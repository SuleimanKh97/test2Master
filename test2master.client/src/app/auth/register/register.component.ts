import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {


  signupForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }


  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required], // ممكن تلغيها إذا مش موجودة بالباك
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      role: ['Buyer', Validators.required], // default role
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  get f() { return this.signupForm.controls; }


  passwordsMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }


  onSubmit(): void {
    this.submitted = true;
    if (this.signupForm.invalid) return;

    const { confirmPassword, acceptTerms, ...registerData } = this.signupForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.successMessage = 'تم إنشاء الحساب بنجاح!';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'حدث خطأ أثناء التسجيل';
      }
    });
  }

  //// Custom validator to check if password and confirmPassword match
  //passwordMatchValidator(formGroup: FormGroup) {
  //  const password = formGroup.get('password')?.value;
  //  const confirmPassword = formGroup.get('confirmPassword')?.value;

  //  if (password !== confirmPassword) {
  //    formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
  //    return { passwordMismatch: true };
  //  } else {
  //    return null;
  //  }
  //}

}
