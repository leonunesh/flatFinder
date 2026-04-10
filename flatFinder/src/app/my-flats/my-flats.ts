import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-flats',
  imports: [CommonModule],
  templateUrl: './my-flats.html',
  styleUrls: ['./my-flats.css'],
})
export class MyFlats {}

export interface Flat {
  id: number;
  title: string;
  address: string;
  price: number;
  rooms: number;
  area: number;
  // adicione aqui outras propriedades conforme sua entidade
}
export class FlatsManagementComponent {
  flats: Flat[] = [
    {
      id: 1,
      title: 'Cozy Studio',
      address: '123 Main St, Vancouver',
      price: 1500,
      rooms: 1,
      area: 35,
    },
    {
      id: 2,
      title: '2BR Apartment',
      address: '456 Oak Ave, Vancouver',
      price: 2500,
      rooms: 2,
      area: 70,
    },
  ];

  constructor(private router: Router) {}

  onInsertNewFlat(): void {
    // aqui você pode navegar para a página de criação ou abrir um modal
    // exemplo com rota:
    this.router.navigate(['/flats/new']);
  }

  onDeleteFlat(flat: Flat): void {
    // lógica de remoção (pode chamar um service)
    const confirmed = confirm(`Delete flat "${flat.title}"?`);
    if (!confirmed) return;

    this.flats = this.flats.filter(f => f.id !== flat.id);
    // em um app real, chame o service e depois atualize a lista
  }

  onViewFlat(flat: Flat): void {
    // navega para a página de visualização do flat
    this.router.navigate(['/flats', flat.id, 'view']);
  }

  onEditFlat(flat: Flat): void {
    // navega para a página de edição do flat
    this.router.navigate(['/flats', flat.id, 'edit']);
  }
}
