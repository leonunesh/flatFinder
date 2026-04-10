import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  loading = false;
  errorMessage = '';
  registerForm: any;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthDate: ['', Validators.required]
    });
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(message));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  async onSubmit() {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password, firstName, lastName, birthDate } = this.registerForm.value;
    const user = { email, password, firstName, lastName, birthDate };

    console.log('Attempting to register user in Auth and Firestore:', user);

    try {
      const userCredential = await this.withTimeout(
        this.firebaseService.register(user),
        20000,
        'Registration took too long. Check your connection and try again.'
      );

      if (!userCredential || !userCredential.user) {
        throw new Error('Unable to create user.');
      }

      console.log('Registration completed successfully:', userCredential.user.uid);
      this.registerForm.reset();
      await this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Error during registration:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message || error);

      // Handle common Firebase errors
      if (error?.code === 'auth/email-already-in-use') {
        this.errorMessage = 'This email is already in use';
      } else if (error?.code === 'auth/weak-password') {
        this.errorMessage = 'Password must have at least 6 characters';
      } else if (error?.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email';
      } else if (error?.code === 'auth/operation-not-allowed') {
        this.errorMessage = 'Email/Password authentication method is not enabled in Firebase.';
      } else if (error?.code === 'auth/configuration-not-found') {
        this.errorMessage = 'Firebase Auth configuration not found. Enable Email/Password in Authentication in the console.';
      } else {
        this.errorMessage = `Error: ${error?.message || 'Unknown error'}`;
      }

    } finally {
      this.loading = false;
      console.log('Loading set to false');
    }
  }
}

