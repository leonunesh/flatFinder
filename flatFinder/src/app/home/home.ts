import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  firstName = '';

  constructor(private firebaseService: FirebaseService) { }

  async ngOnInit() {
    const userData = await this.firebaseService.getCurrentUserData();

    if (userData) {
      this.firstName = userData['firstName'];
    }
  }
}
