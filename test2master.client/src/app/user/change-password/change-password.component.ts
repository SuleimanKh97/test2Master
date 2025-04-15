import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common'; // Needed for standalone

// Optional: Add custom validator for matching passwords
// import { MustMatch } from '../../helpers/must-match.validator'; 

@Component({
    selector: 'app-change-password',
    standalone: true, // Mark as standalone
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
    changePasswordForm!: FormGroup;
    submitted = false;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.changePasswordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]], // Example: min 6 chars
            confirmPassword: ['', Validators.required]
        }, {
            // Optional: Add validator to check if newPassword and confirmPassword match
            // validator: MustMatch('newPassword', 'confirmPassword') 
        });
    }

    get f() { return this.changePasswordForm.controls; }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = null;
        this.successMessage = null;

        if (this.changePasswordForm.invalid) {
            return;
        }

        // Extra check: Ensure new passwords match if validator isn't used
        if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
            this.errorMessage = "كلمة المرور الجديدة وتأكيدها غير متطابقتين.";
            return;
        }

        const passwordData = {
            currentPassword: this.changePasswordForm.value.currentPassword,
            newPassword: this.changePasswordForm.value.newPassword
        };

        this.authService.changePassword(passwordData).subscribe({
            next: (response) => {
                console.log("Password change successful", response);
                this.successMessage = response.message || "تم تغيير كلمة المرور بنجاح.";
                this.changePasswordForm.reset(); // Clear form
                this.submitted = false;
                // Optional: Navigate back after delay
                // setTimeout(() => this.router.navigate(['/profile']), 2000);
            },
            error: (err) => {
                console.error("Password change failed", err);
                this.errorMessage = err.error?.message || "فشل تغيير كلمة المرور.";
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/profile']); // Or wherever appropriate
    }
} 