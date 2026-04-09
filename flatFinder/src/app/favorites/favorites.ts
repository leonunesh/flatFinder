import { Component } from '@angular/core';

@Component({
  selector: 'app-favorites',
  imports: [],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {}

export interface Flat {
  id: number;
  title: string;
  address: string;
  price: number;
  rooms: number;
  area: number;
}
export class FavouritesFlatsComponent {
  favouriteFlats: Flat[] = [
    {
      id: 1,
      title: 'Modern Loft',
      address: '789 Sunset Blvd, Vancouver',
      price: 2200,
      rooms: 1,
      area: 45,
    },
    {
      id: 2,
      title: '3BR Family Home',
      address: '12 Pine Street, Vancouver',
      price: 3200,
      rooms: 3,
      area: 95,
    },
  ];

  removeFromFavourites(flat: Flat): void {
    const confirmed = confirm(`Remove "${flat.title}" from favourites?`);
    if (!confirmed) return;

    this.favouriteFlats = this.favouriteFlats.filter(f => f.id !== flat.id);
  }
}
