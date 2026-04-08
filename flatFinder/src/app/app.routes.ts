import { Routes } from '@angular/router';
import { Home } from './home/home';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { MyFlats } from './my-flats/my-flats';
import { NewFlatComponent } from './new-flat/new-flat';
import { FlatView } from './flat-view/flat-view';
import { Favorites } from './favorites/favorites';
import { MessagesComponent } from './messages/messages.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { UsersPageComponent } from './users-page/users-page.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'my-flats', component: MyFlats },
  { path: 'new-flat', component: NewFlatComponent },
  { path: 'flat-view', component: FlatView },
  { path: 'favorites', component: Favorites },
  { path: 'messages', component: MessagesComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'users', component: UsersPageComponent },
  { path: '**', redirectTo: '' }
];
