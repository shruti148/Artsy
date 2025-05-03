import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environment/environment';




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
export class ArtworksService {
  private apiUrl = environment.apiUrl; // Your backend URL from environment.ts

  constructor(private http: HttpClient) { }

  /**
   * Get categories for a specific artwork
   * @param artworkId The ID of the artwork
   * @returns Observable with array of categories
   */
  // Old code using "genes"
// Updated code using "categories" with the proper endpoint
getArtworkCategories(artworkId: string): Observable<Gene[]> {
    return this.http.get<{ _embedded: { categories: Gene[] } }>(
      `${this.apiUrl}/api/artwork/categories`,
      { params: { artwork_id: artworkId } }
    ).pipe(
      map(response => response._embedded?.categories || []),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]); // Return empty array on error
      })
    );
  }
  
  
  
  /**
   * Get artist details including their artworks
   * @param artistId The ID of the artist
   * @returns Observable with artist details
   */
  getArtistDetails(artistId: string): Observable<ArtistDetails> {
    return this.http.get<ArtistDetails>(`${this.apiUrl}/api/artist/${artistId}`).pipe(
      catchError(error => {
        console.error('Error fetching artist details:', error);
        throw error; // Re-throw to let component handle
      })
    );
  }

  /**
   * Get thumbnail URL for a gene/category
   * @param gene The gene object
   * @param defaultImage Fallback image URL
   * @returns URL string
   */
  getGeneThumbnail(gene: Gene, defaultImage: string = 'assets/artsy_logo.svg'): string {
    return gene._links?.thumbnail?.href || defaultImage;
  }

  /**
   * Get thumbnail URL for an artwork
   * @param artwork The artwork object
   * @param defaultImage Fallback image URL
   * @returns URL string
   */
  getArtworkThumbnail(artwork: Artwork, defaultImage: string = 'assets/artsy_logo.svg'): string {
    if (artwork.thumbnail) {
      return artwork.thumbnail;
    }
    return artwork._links?.thumbnail?.href || defaultImage;
  }

  /**
   * Check if artwork has categories available
   * @param artwork The artwork object
   * @returns True if a categories link exists, false otherwise.
   */
  hasCategories(artwork: Artwork): boolean {
    return !!(artwork._links?.categories?.href);
  }
}
