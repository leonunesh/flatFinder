import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  imports: [],
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
