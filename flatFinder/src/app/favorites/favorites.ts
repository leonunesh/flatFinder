import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class Favorites implements OnInit {
  favoriteFlats: any[] = [];
  loading = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = await this.firebaseService.getCurrentUser();
    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }
    await this.loadFavorites();
  }

  async loadFavorites() {
    this.loading = true;
    try {
      const favorites = await this.firebaseService.getUserFavorites();
      this.favoriteFlats = [];
      
      for (const fav of favorites) {
        const flat = await this.firebaseService.getFlatById(fav.flatId);
        if (flat) {
          this.favoriteFlats.push(flat);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      this.loading = false;
    }
  }

  async removeFromFavorites(flatId: string): Promise<void> {
    const confirmed = confirm('Remove this flat from favorites?');
    if (!confirmed) return;

    try {
      await this.firebaseService.removeFromFavorites(flatId);
      this.favoriteFlats = this.favoriteFlats.filter(f => f.id !== flatId);
      alert('Flat removed from favorites!');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Error removing flat from favorites');
    }
  }

  viewFlat(flatId: string) {
    this.router.navigate(['/flat-view', flatId]);
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}
