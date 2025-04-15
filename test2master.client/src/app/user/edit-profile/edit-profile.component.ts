import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
    editForm!: FormGroup;
    submitted = false;
    errorMessage: string | null = null;
    successMessage: string | null = null;
    // Keep currentUser to compare changes before submitting, but don't use for initial population
    currentUserForCheck: any = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Initialize form first
        this.editForm = this.fb.group({
            newUsername: ['', [Validators.required, Validators.minLength(3)]],
            newEmail: ['', [Validators.required, Validators.email]]
        });

        // Fetch complete user data from the backend API to pre-fill form
        this.loadCurrentUserForForm();
    }

    loadCurrentUserForForm(): void {
        this.errorMessage = null; // Clear previous errors
        this.authService.getCurrentUser().subscribe({
            next: (user) => {
                if (user) {
                    console.log('Current user data loaded for form:', user);
                    this.currentUserForCheck = user; // Store for comparison on submit
                    // Patch the form with data received from API
                    this.editForm.patchValue({
                        newUsername: user.username,
                        newEmail: user.email // Email should be available from this endpoint
                    });
                } else {
                    this.errorMessage = "لم يتم العثور على بيانات المستخدم.";
                }
            },
            error: (err) => {
                console.error("Failed to load current user data:", err);
                this.errorMessage = err.error?.message || "فشل تحميل بيانات المستخدم.";
                // Optional: Redirect if unauthorized (e.g., token expired)
                if (err.status === 401) {
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    get f() { return this.editForm.controls; }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = null;
        this.successMessage = null;

        if (this.editForm.invalid) {
            return;
        }

        const updateData: { newUsername?: string; newEmail?: string } = {
            newUsername: this.editForm.value.newUsername,
            newEmail: this.editForm.value.newEmail
        };

        // Use currentUserForCheck for comparison
        if (this.currentUserForCheck) {
            if (updateData.newUsername === this.currentUserForCheck.username) {
                delete updateData.newUsername;
            }
            if (updateData.newEmail === this.currentUserForCheck.email) {
                delete updateData.newEmail;
            }
        }

        if (Object.keys(updateData).length === 0) {
            this.successMessage = "لا توجد تغييرات لحفظها.";
            return;
        }

        this.authService.updateProfile(updateData).subscribe({
            next: (response) => {
                console.log("Update successful! Full Response:", response);
                this.successMessage = response.message || "تم تحديث الملف الشخصي بنجاح.";

                if (response.newToken) {
                    console.log("New token received:", response.newToken);
                    console.log("Calling authService.setToken()...");
                    try {
                        this.authService.setToken(response.newToken);
                        console.log("authService.setToken() called successfully.");
                    } catch (e) {
                        console.error("Error calling authService.setToken():", e);
                    }
                } else {
                    console.warn("No newToken found in the update response.");
                }

                setTimeout(() => {
                    this.router.navigate(['/profile']);
                }, 1500);
            },
            error: (err) => {
                console.error("Update failed", err);
                this.errorMessage = err.error?.message || "فشل تحديث الملف الشخصي.";
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/profile']);
    }
} 