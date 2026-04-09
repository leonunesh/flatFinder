import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  loading = false;
  errorMessage = '';
  loginForm: any;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      const userCredential = await this.firebaseService.login(email!, password!);

      console.log('User logged in:', userCredential.user);

      alert('Login successful!');

      // 👉 aqui você pode redirecionar depois
      // ex: this.router.navigate(['/dashboard'])

    } catch (error: any) {
      console.error(error);

      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Invalid password';
      } else {
        this.errorMessage = 'Login failed';
      }

    } finally {
      this.loading = false;
    }
  }
}
