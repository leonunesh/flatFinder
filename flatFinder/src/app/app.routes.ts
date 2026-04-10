import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { Home } from './home/home';
import { MyFlats } from './my-flats/my-flats';
import { NewFlatComponent } from './new-flat/new-flat';
import { FlatView } from './flat-view/flat-view';
import { FlatEdit } from './flat-edit/flat-edit';
import { Favorites } from './favorites/favorites';
import { MessagesComponent } from './messages/messages.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { UsersPageComponent } from './users-page/users-page.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'my-flats', component: MyFlats, canActivate: [AuthGuard] },
  { path: 'new-flat', component: NewFlatComponent, canActivate: [AuthGuard] },
  { path: 'flat-view/:id', component: FlatView, canActivate: [AuthGuard] },
  { path: 'flat-edit/:id', component: FlatEdit, canActivate: [AuthGuard] },
  { path: 'favorites', component: Favorites, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersPageComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
