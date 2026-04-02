import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// Firebase
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register-page',
  imports: [],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore
  ) { }

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    birthDate: ['', Validators.required]
  });

  async onSubmit() {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password, firstName, lastName, birthDate } = this.registerForm.value;

    try {
      // 🔐 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email!,
        password!
      );

      const user = userCredential.user;

      // 💾 2. Save extra data in Firestore
      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        birthDate,
        createdAt: new Date()
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

