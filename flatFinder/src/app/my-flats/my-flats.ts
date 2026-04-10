import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

interface Flat {
  id: string;
  name: string;
  address: string;
  city: string;
  rent: number;
  areaSize: number;
  hasAC: boolean;
  yearBuilt: number;
  dateAvailable: string;
  ownerId: string;
}

@Component({
  selector: 'app-my-flats',
  imports: [CommonModule],
  templateUrl: './my-flats.html',
  styleUrls: ['./my-flats.css'],
})
export class MyFlats implements OnInit {
  flats: Flat[] = [];
  loading = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserFlats();
  }

  private async loadUserFlats() {
    this.loading = true;
    try {
      const flatsData = await this.firebaseService.getUserFlats();
      this.flats = flatsData as Flat[];
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    } finally {
      this.loading = false;
    }
  }

  viewFlat(flat: Flat) {
    this.router.navigate(['/flat-view'], {
      queryParams: { id: flat.id }
    });
  }

  editFlat(flat: Flat) {
    this.router.navigate(['/flat-view'], {
      queryParams: { id: flat.id, edit: 'true' }
    });
  }
}
