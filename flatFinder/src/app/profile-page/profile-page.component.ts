import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  userNotFound = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      birthDate: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  private async loadUserData() {
    this.loading = true;
    this.errorMessage = '';
    this.userNotFound = false;

    try {
      const user = await this.firebaseService.getCurrentUser();
      if (!user) {
        await this.router.navigate(['/login']);
        return;
      }

      const userData = await this.firebaseService.getCurrentUserData();
      if (!userData) {
        this.userNotFound = true;
        this.errorMessage = 'Unable to load user data. Please reload the page.';
        return;
      }

      this.profileForm.patchValue({
        firstName: userData['firstName'] || '',
        lastName: userData['lastName'] || '',
        email: userData['email'] || user.email || '',
        birthDate: this.normalizeDate(userData['birthDate'])
      });
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      this.userNotFound = true;
      this.errorMessage = 'Failed to load profile data. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private normalizeDate(value: any): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value.split('T')[0];
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'object' && 'seconds' in value) {
      return new Date(value.seconds * 1000).toISOString().split('T')[0];
    }

    return String(value);
  }

  async onSave() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { firstName, lastName, birthDate } = this.profileForm.getRawValue();
      const success = await this.firebaseService.updateCurrentUserData({
        firstName,
        lastName,
        birthDate
      });

      if (!success) {
        this.errorMessage = 'User not found or not authenticated.';
        return;
      }

      this.successMessage = 'Profile updated successfully!';
    } catch (error: any) {
      console.error('Error saving profile:', error);
      this.errorMessage = 'Failed to save changes. Please try again.';
    } finally {
      this.saving = false;
    }
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}
