import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminUserService, AdminUser, AddUserModel } from '../../Services/admin/admin-user.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-user-list',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe, FormsModule],
    providers: [DatePipe],
    templateUrl: './admin-user-list.component.html',
    styleUrls: ['./admin-user-list.component.css']
})
export class AdminUserListComponent implements OnInit {
    users$: Observable<AdminUser[]> = of([]);
    isLoading = true;
    errorMessage: string | null = null;
    successMessage: string | null = null;
    // Add variables for Add User form
    showAddUserForm: boolean = false;
    newUser: Partial<AdminUser> & { password?: string } = { role: 'Buyer' }; // Default role to Buyer

    // Variables for inline editing
    editingUser: AdminUser | null = null;
    originalUser: AdminUser | null = null; // To store original data for cancellation
    availableRoles: string[] = ['Buyer', 'Seller', 'Admin']; // Define available roles

    constructor(private adminUserService: AdminUserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.editingUser = null; // Reset editing state on load
        this.users$ = this.adminUserService.getUsers().pipe(
            catchError(err => {
                this.errorMessage = err.error?.message || err.message || 'Failed to load users.';
                this.isLoading = false;
                return of([]);
            })
        );
        this.users$.subscribe(() => this.isLoading = false);
    }

    startEditing(user: AdminUser): void {
        // Create a shallow copy for editing to avoid modifying the original object directly
        // Use structuredClone for a deep copy if nested objects are involved
        this.originalUser = { ...user }; // Store original state
        this.editingUser = { ...user }; // Set user for editing
    }

    saveEdit(): void {
        if (!this.editingUser) return;

        // Basic validation (can be expanded)
        if (!this.editingUser.username || !this.editingUser.email || !this.editingUser.role) {
            this.errorMessage = "Username, Email, and Role cannot be empty.";
            return;
        }

        this.isLoading = true; // Show loading indicator during save
        this.errorMessage = null;
        this.successMessage = null;

        // Assume updateUser exists in the service
        this.adminUserService.updateUser(this.editingUser.id, this.editingUser).subscribe({
            next: (res) => {
                this.successMessage = 'User updated successfully.';
                this.editingUser = null; // Exit editing mode
                this.originalUser = null;
                this.loadUsers(); // Refresh the list to show updated data
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || err.message || 'Failed to update user.';
                this.isLoading = false; // Hide loading indicator on error
                // Optionally: revert changes in the UI if save fails?
                // this.cancelEdit(); // Reverts to original data
            }
            // No need for complete block if isLoading is handled in loadUsers
        });
    }

    cancelEdit(): void {
        this.editingUser = null;
        this.originalUser = null;
        this.errorMessage = null; // Clear any validation errors
    }

    deleteUser(userToDelete: AdminUser): void {
        // Prevent deleting other admins
        if (userToDelete.role === 'Admin') {
            this.errorMessage = 'لا يمكن حذف مسؤول آخر.';
            this.successMessage = null;
            // Optionally hide the message after a few seconds
            setTimeout(() => this.errorMessage = null, 5000);
            return; // Stop execution
        }

        // Use a more user-friendly confirmation
        if (!confirm(`هل أنت متأكد أنك تريد حذف المستخدم ${userToDelete.username}؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        this.isLoading = true; // Show loading indicator
        this.errorMessage = null;
        this.successMessage = null;

        this.adminUserService.deleteUser(userToDelete.id).subscribe({
            next: (res) => {
                // Use message from response if available
                this.successMessage = res?.message || 'User deleted successfully.';
                this.loadUsers(); // Refresh list
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || err.message || 'Failed to delete user.';
                this.isLoading = false; // Hide loading indicator on error
            }
        });
    }

    // Placeholder for role change modal/logic
    changeRole(user: AdminUser): void {
        const newRole = prompt(`Enter new role for ${user.username} (Buyer, Seller, Admin):`, user.role);
        if (newRole && ['Buyer', 'Seller', 'Admin'].includes(newRole)) {
            console.log(`Attempting to change role for ${user.id} to ${newRole}`);
            this.adminUserService.updateUserRole(user.id, newRole as any).subscribe({
                next: (res) => {
                    this.successMessage = res.message || 'Role updated successfully.';
                    this.loadUsers(); // Refresh list
                    setTimeout(() => this.successMessage = null, 3000);
                },
                error: (err) => this.errorMessage = err.message || 'Failed to update role.'
            });
        } else if (newRole !== null) { // Only show alert if prompt was not cancelled
            alert('Invalid role entered.');
        }
    }

    // Helper function for role badge class (if needed in template)
    getRoleClass(role: string): string {
        switch (role) {
            case 'Admin': return 'bg-danger';
            case 'Seller': return 'bg-warning text-dark';
            case 'Buyer': return 'bg-info text-dark';
            default: return 'bg-secondary';
        }
    }

    // --- Add User Methods ---
    toggleAddUserForm(): void {
        this.showAddUserForm = !this.showAddUserForm;
        this.newUser = { role: 'Buyer' }; // Reset form when toggling
        this.errorMessage = null;
        this.successMessage = null;
    }

    addUser(): void {
        // Explicitly check for required fields for adding
        if (!this.newUser.username || !this.newUser.email || !this.newUser.password || !this.newUser.role) {
            this.errorMessage = 'الرجاء ملء جميع الحقول المطلوبة (اسم المستخدم، البريد الإلكتروني، كلمة المرور، الدور).';
            this.successMessage = null; // Clear success message too
            return;
        }

        // Create an object guaranteed to match AddUserModel structure,
        // satisfying TypeScript AND the runtime check ensures properties exist.
        const userToAdd: AddUserModel = {
            username: this.newUser.username, // Guaranteed string by check
            email: this.newUser.email,       // Guaranteed string by check
            password: this.newUser.password, // Guaranteed string by check
            role: this.newUser.role         // Guaranteed string by check
        };

        this.isLoading = true;
        this.errorMessage = null;
        this.successMessage = null;

        // Pass the correctly typed object to the service
        this.adminUserService.addUser(userToAdd).subscribe({
            next: (res) => {
                this.successMessage = res?.message || 'تمت إضافة المستخدم بنجاح.';
                this.showAddUserForm = false; // Hide form
                this.newUser = { role: 'Buyer' }; // Reset form
                this.loadUsers(); // Refresh list
                setTimeout(() => this.successMessage = null, 3000);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || err.message || 'فشل في إضافة المستخدم.';
                this.isLoading = false;
            }
        });
    }
    // --- End Add User Methods ---
} 