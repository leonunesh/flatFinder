import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})

export class LoginPageComponent {

  loading = false;
  errorMessage = '';
  loginForm: any;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
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
      await this.router.navigate(['/home']);

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
