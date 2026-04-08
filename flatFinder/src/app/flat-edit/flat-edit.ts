import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-flat-edit',
  imports: [],
  templateUrl: './flat-edit.html',
  styleUrl: './flat-edit.css',
})
export class FlatEdit {}

export interface Flat {
  id: string;
  name: string;
  address: string;
  city: string;
  rent: number;
  areaSize: number;
  hasAC: boolean;
  yearBuilt: number;
  dateAvailable: string; // ISO date string
  ownerId?: string;
}

export class FlatDetailsComponent {
  @Input() flat: Flat | null = null;
  @Input() currentUserId: string | null = null; // id do usuário logado
  @Output() flatUpdated = new EventEmitter<Flat>();

  editMode = false;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      rent: [0, [Validators.required, Validators.min(0)]],
      areaSize: [0, [Validators.required, Validators.min(0)]],
      hasAC: [false],
      yearBuilt: [new Date().getFullYear(), [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      dateAvailable: ['', Validators.required]
    });
  }

  get isOwner(): boolean {
    return !!(this.flat && this.currentUserId && this.flat.ownerId === this.currentUserId);
  }

  startEdit(): void {
    if (!this.flat) return;
    this.editMode = true;
    this.form.patchValue({
      name: this.flat.name,
      address: this.flat.address,
      city: this.flat.city,
      rent: this.flat.rent,
      areaSize: this.flat.areaSize,
      hasAC: this.flat.hasAC,
      yearBuilt: this.flat.yearBuilt,
      dateAvailable: this.flat.dateAvailable ? this.flat.dateAvailable.split('T')[0] : ''
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.form.reset();
  }

  save(): void {
    if (!this.flat) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: Flat = {
      ...this.flat,
      ...this.form.value,
      dateAvailable: new Date(this.form.value.dateAvailable).toISOString()
    };

    // Emite o flat atualizado para o componente pai
    this.flatUpdated.emit(updated);

    // Atualiza localmente e sai do modo edição
    this.flat = updated;
    this.editMode = false;
  }
}