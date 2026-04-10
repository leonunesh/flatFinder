import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  firstName = '';
  allFlats: any[] = [];
  favoriteIds: Set<string> = new Set();
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

    const userData = await this.firebaseService.getCurrentUserData();
    if (userData) {
      this.firstName = userData['firstName'];
    }
    await this.loadAllFlats();
    await this.loadFavorites();
  }

  async loadAllFlats() {
    this.loading = true;
    try {
      this.allFlats = await this.firebaseService.getAllFlats();
    } catch (error) {
      console.error('Error loading flats:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadFavorites() {
    try {
      const favorites = await this.firebaseService.getUserFavorites();
      this.favoriteIds = new Set(favorites.map((f: any) => f.flatId));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  async toggleFavorite(flatId: string) {
    try {
      if (this.favoriteIds.has(flatId)) {
        await this.firebaseService.removeFromFavorites(flatId);
        this.favoriteIds.delete(flatId);
      } else {
        await this.firebaseService.addToFavorites(flatId);
        this.favoriteIds.add(flatId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites');
    }
  }

  isFavorite(flatId: string): boolean {
    return this.favoriteIds.has(flatId);
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}
