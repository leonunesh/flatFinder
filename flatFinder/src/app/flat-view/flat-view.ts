import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flat-view',
  imports: [CommonModule],
  templateUrl: './flat-view.html',
  styleUrl: './flat-view.css',
})
export class FlatView {
  flat: any = {
    name: 'Sample Flat',
    address: '123 Main St',
    city: 'Sample City',
    rent: 1500,
    areaSize: 75,
    hasAC: true,
    yearBuilt: 2020,
    dateAvailable: new Date()
  };
}
