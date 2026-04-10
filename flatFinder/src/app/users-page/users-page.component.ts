import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-users-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit {
  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  users: any[] = [];
  isAdmin = false;
  loading = true;

  async ngOnInit() {
    const user = await this.firebaseService.getCurrentUser();
    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = await this.firebaseService.isAdmin();

    if (!this.isAdmin) {
      alert('Access denied');
      this.loading = false;
      return;
    }

    this.users = await this.firebaseService.getAllUsers();
    this.loading = false;
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}
