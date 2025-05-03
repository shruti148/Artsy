import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ArtworksService } from '../../services/artworks.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})
export class ArtistDetailComponent implements OnInit {
  @ViewChild('categoriesModal') categoriesModal!: ElementRef;
  
  artist: any;
  selectedArtwork: any = null;
  categories: any[] = [];
  loadingCategories: boolean = false;
  categoriesError: string | null = null;

  // Boolean flag to show if the current artist is favorited.
  isFavorite: boolean = false;
  // Boolean flag for authentication state.
  isLoggedIn: boolean = false;
  
  constructor(
    public artworksService: ArtworksService,
    private route: ActivatedRoute,
    private favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const artistId = this.route.snapshot.params['id'];
    this.loadArtist(artistId);

    // Subscribe to AuthService to update logged-in state.
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  loadArtist(artistId: string): void {
    this.artworksService.getArtistDetails(artistId).subscribe({
      next: (artistData) => {
        this.artist = artistData;
        // Check if the current artist is in favorites.
        this.loadFavorites();
      },
      error: (err) => console.error('Error loading artist:', err)
    });
  }

  loadFavorites(): void {
    this.favoritesService.getFavorites().subscribe({
      next: (response) => {
        const favorites = response.favorites;
        // Check if the current artist is among favorites.
        this.isFavorite = favorites.some((fav: any) => fav.artistId === this.artist.id);
      },
      error: (err) => console.error('Error loading favorites:', err)
    });
  }

  toggleFavorite(): void {
    if (!this.artist || !this.artist.id) return;

    if (this.isFavorite) {
      // Remove favorite if already added.
      this.favoritesService.removeFavorite(this.artist.id).subscribe({
        next: () => {
          console.log(`${this.artist.name} removed from favorites.`);
          this.isFavorite = false;
        },
        error: (err) => console.error('Error removing favorite:', err)
      });
    } else {
      // Add favorite – construct a Favorite object using properties from artist.
      const newFavorite = {
        artistId: this.artist.id,
        artistName: this.artist.name,
        thumbnail: this.artist.thumbnail // Adjust this if needed.
      };
      this.favoritesService.addFavorite(newFavorite).subscribe({
        next: () => {
          console.log(`${this.artist.name} added to favorites.`);
          this.isFavorite = true;
        },
        error: (err) => console.error('Error adding favorite:', err)
      });
    }
  }

  showCategories(artwork: any): void {
    this.selectedArtwork = artwork;
    this.loadingCategories = true;
    this.categoriesError = '';

    if (!artwork.id) {
      console.error('No artwork ID available');
      this.categoriesError = 'No artwork ID available';
      this.loadingCategories = false;
      return;
    }

    this.artworksService.getArtworkCategories(artwork.id).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
        // Show modal after categories are loaded.
        const modal = new bootstrap.Modal(this.categoriesModal.nativeElement);
        modal.show();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categoriesError = 'Failed to load categories';
        this.loadingCategories = false;
      }
    });
  }

  // Helper method to format the artwork date; customize formatting as needed.
  formatArtworkDate(date: string): string {
    return date;
  }
}
