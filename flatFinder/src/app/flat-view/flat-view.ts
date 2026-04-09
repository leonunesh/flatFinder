import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-flat-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './flat-view.html',
  styleUrls: ['./flat-view.css'],
})
export class FlatView {
  flat: Flat | null = {
    id: '1',
    name: 'Sample Flat',
    address: '123 Main St',
    city: 'Sample City',
    rent: 1200,
    areaSize: 80,
    hasAC: true,
    yearBuilt: 2021,
    dateAvailable: new Date().toISOString(),
    ownerId: 'user-123'
  };

  currentUserId: string | null = 'user-123';
  editMode = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      rent: [0, [Validators.required, Validators.min(0)]],
      areaSize: [0, [Validators.required, Validators.min(0)]],
      hasAC: [false],
      yearBuilt: [new Date().getFullYear(), [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      dateAvailable: ['', Validators.required]
    });
  }

  get isOwner(): boolean {
    return !!(this.flat && this.currentUserId && this.flat.ownerId === this.currentUserId);
  }

  startEdit(): void {
    if (!this.flat) return;

    const dialogRef = this.dialog.open(FlatDetailsComponent, {
      width: '600px',
      data: { flat: this.flat },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.flat = result;
        // Aqui você pode emitir um evento ou salvar no serviço
        console.log('Flat updated:', result);
      }
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

    this.flat = updated;
    this.editMode = false;
  }
}

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

@Component({
  selector: 'app-flat-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './flat-details.html',
  styleUrls: ['./flat-details.css']
})
export class FlatDetailsComponent {
  flat: Flat;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FlatDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { flat: Flat }
  ) {
    this.flat = data.flat;
    this.form = this.fb.group({
      name: [this.flat.name, Validators.required],
      address: [this.flat.address, Validators.required],
      city: [this.flat.city, Validators.required],
      rent: [this.flat.rent, [Validators.required, Validators.min(0)]],
      areaSize: [this.flat.areaSize, [Validators.required, Validators.min(0)]],
      hasAC: [this.flat.hasAC],
      yearBuilt: [this.flat.yearBuilt, [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      dateAvailable: [this.flat.dateAvailable ? new Date(this.flat.dateAvailable) : '', Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: Flat = {
      ...this.flat,
      ...this.form.value,
      dateAvailable: new Date(this.form.value.dateAvailable).toISOString()
    };

    this.dialogRef.close(updated);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}