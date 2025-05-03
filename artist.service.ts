import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError, tap } from 'rxjs';

// Interface for basic artist data
export interface Artist {
  id: string;
  name: string;
  thumbnail: string;
  isHovered?: boolean;
}

// Interface for artwork data
export interface Artwork {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  _links?: {
    categories?: {
      href: string;
    };
    thumbnail?: {
      href: string;
    };
  };
}

// Interface for gene/category data
export interface Gene {
  id: string;
  name: string;
  genes: [];
  _links?: {
    thumbnail?: {
      href: string;
    };
  };
}

// Interface for artist details including artworks
export interface ArtistDetails {
  id: string;
  name: string;
  birthday?: string;
  deathday?: string;
  nationality?: string;
  biography?: string;
  thumbnail?: string;
  artworks: Artwork[];
}

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = 'https://webhw3-angular-94534.wl.r.appspot.com';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Search for artists by name.
   * @param artistName The name of the artist.
   * @returns Observable of an array of Artist objects.
   */
  searchArtists(artistName: string): Observable<Artist[]> {
    return this.http.get(`${this.apiUrl}/search`, { params: { name: artistName } })
      .pipe(
        map(response => {
          console.log('Searching for artists:', artistName);
          console.log('Artist.ts:', response); 
          return Object.values(response) as Artist[];
        }),
        catchError(error => {
          console.error('Error fetching artists:', error);
          return of([]);
        })
      );
  }
        
  /**
   * Get the detailed information of an artist.
   * @param artistId The ID of the artist.
   * @returns Observable of an ArtistDetails object.
   */
  getArtistDetails(artistId: string): Observable<ArtistDetails> {
    // This may need to be adjusted based on the actual API
    return this.http.get<ArtistDetails>(`${this.apiUrl}/artist/${artistId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching artist details:', error);
          throw error;
        })
      );
  }

  getSimilarArtists(artistId: string): Observable<Artist[]> {
    console.log(`Getting similar artists for artist ID: ${artistId}`);
    
    // Using the consistent API path pattern
    return this.http.get<Artist[]>(`${this.apiUrl}/artist/similar/${artistId}`)
      .pipe(
        tap(artists => console.log('Similar artists retrieved:', artists)),
        catchError(error => {
          console.error('Error getting similar artists:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get categories for a specific artwork.
   * @param artworkId The ID of the artwork.
   * @returns Observable of an array of Gene (category) objects.
   */
  getArtworkCategories(artworkId: string): Observable<any> {
    // This may need to be adjusted based on the actual API
    return this.http.get<{ _embedded: { genes: [] } }>(
      `${this.apiUrl}/artwork/categories/${artworkId}`
    ).pipe(
      map(response => {
        console.log('Fetching categories for artwork:', artworkId);
        console.log('Categories response:', response._embedded); 
        return response._embedded.genes
      }),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]); // Return empty array on error
      })
    );
  }
}