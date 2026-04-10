import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-users-page',
  imports: [CommonModule],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit {

  users: any[] = [];
  isAdmin = false;
  loading = true;

  constructor(private firebaseService: FirebaseService) { }

  async ngOnInit() {
    this.isAdmin = await this.firebaseService.isAdmin();

    if (!this.isAdmin) {
      alert('Access denied');
      this.loading = false;
      return;
    }

    this.users = await this.firebaseService.getAllUsers();
    this.loading = false;
  }

}
