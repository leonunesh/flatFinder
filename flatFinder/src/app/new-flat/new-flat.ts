import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-flat',
  imports: [ReactiveFormsModule],
  templateUrl: './new-flat.html',
  styleUrls: ['./new-flat.css']
})
export class NewFlatComponent {

  flatForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.flatForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      rent: ['', [Validators.required, Validators.min(0)]],
      areaSize: ['', [Validators.required, Validators.min(0)]],
      hasAC: [false],
      yearBuilt: ['', [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      dateAvailable: ['', Validators.required]
    });
  }

  async submitForm() {
    if (this.flatForm.invalid) {
      this.flatForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    try {
      const flatData = {
        name: this.flatForm.value.name,
        address: this.flatForm.value.address,
        city: this.flatForm.value.city,
        rent: Number(this.flatForm.value.rent),
        areaSize: Number(this.flatForm.value.areaSize),
        hasAC: this.flatForm.value.hasAC,
        yearBuilt: Number(this.flatForm.value.yearBuilt),
        dateAvailable: new Date(this.flatForm.value.dateAvailable).toISOString()
      };

      const flatId = await this.firebaseService.createFlat(flatData);

      if (flatId) {
        alert('Imóvel adicionado com sucesso!');
        this.flatForm.reset();
        this.router.navigate(['/my-flats']);
      } else {
        alert('Erro ao adicionar imóvel. Verifique se você está logado.');
      }
    } catch (error) {
      console.error('Erro ao criar imóvel:', error);
      alert('Erro ao adicionar imóvel. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }
}