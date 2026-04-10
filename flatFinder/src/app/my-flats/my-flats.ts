import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-my-flats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-flats.html',
  styleUrls: ['./my-flats.css'],
})
export class MyFlats implements OnInit {
  flats: any[] = [];
  loading = false;
  loaded = false;
  firstName = '';

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    const user = await this.firebaseService.getCurrentUser();
    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    const userData = await this.firebaseService.getCurrentUserData();
    if (userData) {
      this.firstName = userData['firstName'];
    }

    await this.loadFlats();
  }

  async loadFlats() {
    this.loading = true;
    this.loaded = false;
    try {
      this.flats = await this.firebaseService.getUserFlats();
    } catch (error) {
      console.error('Error loading flats:', error);
      alert('Error loading flats. Please try again.');
    } finally {
      this.loading = false;
      this.loaded = true;
    }
  }

  onInsertNewFlat(): void {
    this.router.navigate(['/new-flat']);
  }

  async onDeleteFlat(flat: any): Promise<void> {
    const confirmed = confirm(`Delete flat "${flat.name}"?`);
    if (!confirmed) return;

    try {
      await this.firebaseService.deleteFlat(flat.id);
      this.flats = this.flats.filter(f => f.id !== flat.id);
      alert('Flat deleted successfully!');
    } catch (error) {
      console.error('Error deleting flat:', error);
      alert('Error deleting flat. Please try again.');
    }
  }

  onViewFlat(flat: any): void {
    this.router.navigate(['/flat-view', flat.id]);
  }

  onEditFlat(flat: any): void {
    this.router.navigate(['/flat-edit', flat.id]);
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}
