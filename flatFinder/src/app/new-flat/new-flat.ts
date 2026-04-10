import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-flat',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './new-flat.html',
  styleUrls: ['./new-flat.css']
})
export class NewFlatComponent implements OnInit {
  async ngOnInit() {
    const user = await this.firebaseService.getCurrentUser();
    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }
  }

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
        alert('Flat added successfully!');
        this.flatForm.reset();
        this.router.navigate(['/my-flats']);
      } else {
        alert('Error adding flat. Please check if you are logged in.');
      }
    } catch (error: any) {
      console.error('Error creating flat:', error);
      if (error?.message === 'User not authenticated') {
        alert('You must be logged in to add a flat.');
        await this.router.navigate(['/login']);
      } else {
        alert('Error adding flat. Please try again.');
      }
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}