import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    private firebaseService: FirebaseService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      birthDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  private async loadUserData() {
    this.loading = true;
    this.errorMessage = '';
    this.userNotFound = false;
    try {
      const userData = await this.firebaseService.getCurrentUserData();

      if (!userData) {
        this.userNotFound = true;
        return;
      }

      this.profileForm.patchValue({
        firstName: userData['firstName'] || '',
        lastName: userData['lastName'] || '',
        email: userData['email'] || '',
        birthDate: userData['birthDate'] || ''
      });
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      this.errorMessage = 'Não foi possível carregar os dados do perfil.';
    } finally {
      this.loading = false;
    }
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
        this.errorMessage = 'Usuário não encontrado ou não autenticado.';
        return;
      }

      this.successMessage = 'Perfil atualizado com sucesso!';
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      this.errorMessage = 'Não foi possível salvar as alterações.';
    } finally {
      this.saving = false;
    }
  }
}
