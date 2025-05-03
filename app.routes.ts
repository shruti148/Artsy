import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { ArtistDetailComponent } from './pages/artist-detail/artist-detail.component';


export const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'favorites', component: SearchComponent },
  { path: 'artist/:id', component: ArtistDetailComponent }
];
