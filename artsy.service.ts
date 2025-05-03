// src/app/services/artsy.service.ts (or a dedicated service for artist-related functionality)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Artist {
  id: string;
  name: string;
  // Add other artist properties, e.g., thumbnail URL, biography, etc.
}

@Injectable({
  providedIn: 'root'
})
export class ArtsyService {
  private baseUrl = 'http://localhost:3000/api'; // Adjust if necessary

  constructor(private http: HttpClient) {}

  // Method to fetch similar artists
  getSimilarArtists(artistId: string): Observable<{ similarArtists: Artist[] }> {
    return this.http.get<{ similarArtists: Artist[] }>(`${this.baseUrl}/artist/similar/${artistId}`);
  }
}
