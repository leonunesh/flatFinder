import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-flat',
  imports: [ReactiveFormsModule],
  templateUrl: './new-flat.html',
  styleUrl: './new-flat.css'
})
export class NewFlatComponent {

  flatForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.flatForm = this.fb.group({
      flatName: ['', Validators.required],
      flatAddress: ['', Validators.required],
      flatCity: ['', Validators.required],
      flatRent: ['', Validators.required],
      areaSize: ['', Validators.required],
      hasAC: [false],
      yearBuilt: ['', Validators.required],
      dateAvailable: ['', Validators.required]
    });
  }

  submitForm() {
    if (this.flatForm.valid) {
      console.log('Flat added:', this.flatForm.value);
      alert('Flat added successfully!');
      this.flatForm.reset();
    } else {
      alert('Please fill all required fields.');
    }
  }
}