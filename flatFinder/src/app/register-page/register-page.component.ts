import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  loading = false;
  errorMessage = '';
  registerForm: any;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthDate: ['', Validators.required]
    });
  }

  async onSubmit() {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password, firstName, lastName, birthDate } = this.registerForm.value;

    try {
      await this.firebaseService.register({
        email,
        password,
        firstName,
        lastName,
        birthDate
      });

      alert('User registered successfully!');
      this.registerForm.reset();

    } catch (error: any) {
      console.error(error);

      // Handle common Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Password is too weak';
      } else {
        this.errorMessage = 'Something went wrong';
      }

    } finally {
      this.loading = false;
    }
  }
}

