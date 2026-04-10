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

    console.log('Tentando registrar usuário no Auth e no Firestore:', user);

    try {
      const userCredential = await this.withTimeout(
        this.firebaseService.register(user),
        20000,
        'O registro demorou muito. Verifique sua conexão e tente novamente.'
      );

      if (!userCredential || !userCredential.user) {
        throw new Error('Não foi possível criar o usuário.');
      }

      console.log('Cadastro concluído com sucesso:', userCredential.user.uid);
      this.registerForm.reset();
      await this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Erro no registro:', error);
      console.error('Código do erro:', error?.code);
      console.error('Mensagem do erro:', error?.message || error);

      // Handle common Firebase errors
      if (error?.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Este email já está em uso';
      } else if (error?.code === 'auth/weak-password') {
        this.errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error?.code === 'auth/invalid-email') {
        this.errorMessage = 'Email inválido';
      } else if (error?.code === 'auth/operation-not-allowed') {
        this.errorMessage = 'O método de autenticação Email/Senha não está habilitado no Firebase.';
      } else if (error?.code === 'auth/configuration-not-found') {
        this.errorMessage = 'Configuração do Firebase Auth não encontrada. Habilite Email/Senha em Authentication no console.';
      } else {
        this.errorMessage = `Erro: ${error?.message || 'Erro desconhecido'}`;
      }

    } finally {
      this.loading = false;
      console.log('Loading definido como false');
    }
  }
}

