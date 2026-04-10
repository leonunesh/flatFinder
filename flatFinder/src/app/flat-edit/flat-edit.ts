import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flat-edit',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './flat-edit.html',
  styleUrls: ['./flat-edit.css']
})
export class FlatEdit implements OnInit {

  flatForm: FormGroup;
  loading = false;
  flatId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
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

  async ngOnInit() {
    this.flatId = this.route.snapshot.paramMap.get('id');
    if (this.flatId) {
      await this.loadFlat();
    }
  }

  async loadFlat() {
    if (!this.flatId) return;
    this.loading = true;
    try {
      const flat = await this.firebaseService.getFlatById(this.flatId);
      if (flat) {
        this.flatForm.patchValue({
          name: flat.name,
          address: flat.address,
          city: flat.city,
          rent: flat.rent,
          areaSize: flat.areaSize,
          hasAC: flat.hasAC,
          yearBuilt: flat.yearBuilt,
          dateAvailable: flat.dateAvailable.split('T')[0] // Assuming ISO string, take date part
        });
      } else {
        alert('Flat not found.');
        this.router.navigate(['/my-flats']);
      }
    } catch (error) {
      console.error('Error loading flat:', error);
      alert('Error loading flat. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  async submitForm() {
    if (this.flatForm.invalid || !this.flatId) {
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

      await this.firebaseService.updateFlat(this.flatId, flatData);

      alert('Flat updated successfully!');
      this.router.navigate(['/my-flats']);
    } catch (error) {
      console.error('Error updating flat:', error);
      alert('Error updating flat. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
