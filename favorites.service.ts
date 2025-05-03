// src/app/services/favorites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ArtistFavorite {
  _id?: string;         // MongoDB document ID
  artistId: string;
  artistName: string;
  thumbnail?: string;
  addedAt?: string;
  birthYear?: string;
  deathYear?: string;
  nationality?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  // Base URL for favorites endpoints
  // For instance: GET http://localhost:3000/api/favorites, etc.
  private baseUrl = 'https://webhw3-angular-94534.wl.r.appspot.com/favorites';

  constructor(private http: HttpClient) {}

  // GET all favorites (cookie-based auth will supply the JWT automatically if the browser has it)
  getFavorites(): Observable<{ favorites: ArtistFavorite[] }> {
    return this.http.get<{ favorites: ArtistFavorite[] }>(this.baseUrl, { withCredentials: true });
  }

  // POST: Add a favorite artist
 // In your FavoritesService
// In your FavoritesService
addFavorite(favorite: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/add`, favorite, { withCredentials: true });
}
  // POST: Remove a favorite (using artistId)
  removeFavorite(artistId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/remove`, { artistId }, { withCredentials: true });
  }
}
