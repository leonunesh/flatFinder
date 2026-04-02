import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-users-page',
  imports: [],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css'
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
