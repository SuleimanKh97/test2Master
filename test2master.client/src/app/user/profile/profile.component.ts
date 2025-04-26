import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../Models/user.module';

interface UserProfile {
  username: string;
  email: string;
  role: string;
  createdAt: string; // Or Date
  profileImage?: string; // URL لصورة الملف الشخصي
  // Add other fields if returned by API (like orders)
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userData: UserProfile | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.errorMessage = null;
    this.authService.getCurrentUser().subscribe({
      next: (data: UserProfile) => {
        console.log('User profile data received:', data);
        this.userData = data;
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
        this.errorMessage = err.error?.message || 'Could not load user profile data.';
        if (err.status === 401) {
          // Handle unauthorized access, maybe redirect to login
        }
      }
    });
  }
}
