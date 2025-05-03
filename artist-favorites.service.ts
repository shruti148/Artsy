import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FavoriteArtist } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistFavoritesService {
  // Base URL for favorites endpoints.
  private apiUrl = '/api/favorites';

  // BehaviorSubject to hold the current favorites list.
  private favoritesSubject = new BehaviorSubject<FavoriteArtist[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load favorites initially when the service is created.
    this.loadFavorites();
  }

  /**
   * Loads the favorites from the backend and updates the BehaviorSubject.
   * If there is an error, an empty list is set.
   */
  private loadFavorites(): void {
    this.http.get<{ favorites: FavoriteArtist[] }>(this.apiUrl, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error loading favorites in service:', error);
          return of({ favorites: [] });
        })
      )
      .subscribe(response => {
        this.favoritesSubject.next(response.favorites);
      });
  }

  /**
   * Retrieves the favorites list from the backend.
   * Updates the BehaviorSubject with the result.
   * Returns an observable with the favorites list.
   */
  getFavorites(): Observable<{ favorites: FavoriteArtist[] }> {
    return this.http.get<{ favorites: FavoriteArtist[] }>(this.apiUrl, { withCredentials: true })
      .pipe(
        tap(response => {
          // Update local favorites list.
          this.favoritesSubject.next(response.favorites);
        }),
        catchError(error => {
          console.error('Error retrieving favorites:', error);
          return of({ favorites: [] });
        })
      );
  }

  /**
   * Adds a new favorite by calling the backend.
   * Updates the local favorites list with the response.
   * @param favorite The favorite to add.
   * @returns An Observable with the updated favorites list.
   */
  addFavorite(favorite: FavoriteArtist): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, favorite, { withCredentials: true })
      .pipe(
        tap(response => {
          // Update local favorites list with new data from the backend.
          this.favoritesSubject.next(response.favorites);
        }),
        catchError(error => {
          console.error('Error adding favorite:', error);
          return of(null);
        })
      );
  }

  /**
   * Removes a favorite using the artistId.
   * Updates the local favorites list with the response.
   * @param artistId The artist ID to remove.
   * @returns An Observable with the updated favorites list.
   */
  removeFavorite(artistId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/remove`, { artistId }, { withCredentials: true })
      .pipe(
        tap(response => {
          // Update local favorites list with new data from the backend.
          this.favoritesSubject.next(response.favorites);
        }),
        catchError(error => {
          console.error('Error removing favorite:', error);
          return of(null);
        })
      );
  }

  /**
   * Checks if the given artist is in the favorites list.
   * @param artistId The ID of the artist to check.
   * @returns true if the artist is already a favorite, false otherwise.
   */
  isFavorite(artistId: string): boolean {
    return this.favoritesSubject.value.some(fav => fav.artistId === artistId);
  }
}
