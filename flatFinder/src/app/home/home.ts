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

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  async ngOnInit() {
    const userData = await this.firebaseService.getCurrentUserData();

    if (userData) {
      this.firstName = userData['firstName'];
    }
  }

  async logout() {
    await this.firebaseService.logout();
    await this.router.navigate(['/login']);
  }
}
