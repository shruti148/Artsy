import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ArtistService, Artist, ArtistDetails } from '../../services/artist.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
import { SimilarArtistsComponent } from '../artist-detail/similar-artists.component';
import * as bootstrap from 'bootstrap';

@Component({
  standalone: true,
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SearchComponent implements OnInit {
  artistName: string = '';
  artists: Artist[] = [];
  loading: boolean = false;
  searchPerformed: boolean = false;
  showModal: boolean = false;

  selectedArtist: ArtistDetails | null = null;
  activeTab: string = 'info'; // 'info' or 'artworks'

  // Properties for category retrieval
  selectedArtwork: any = null;
  categories: any[] = [];
  categoriesLoading: boolean = false;
  categoriesError: string = '';

  // Authentication and favorites state
  isLoggedIn: boolean = true; // Force to true for testing
  favorites: any[] = [];

  // Similar artists array – will store up to 5 similar artist cards
  similarArtists: any[] = [];
  // Notification system state
notifications: { message: string; type: 'success' | 'danger'; id: number }[] = [];
notificationId = 0;

  
  // Flag to determine if we're in favorites view or search view
  isFavoritesView: boolean = false;
  favoritesLoading: boolean = false;

  constructor(
    private artistService: ArtistService,
    private http: HttpClient,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('Search component initialized');
    
    // Check the current route to determine the view
    this.route.url.subscribe(segments => {
      const isFavorites = segments.some(segment => segment.path === 'favorites');
      
      // If we switched to favorites view, load favorites immediately
      if (isFavorites && !this.isFavoritesView && this.isLoggedIn) {
        this.favoritesLoading = true;
        this.loadFavorites();
      }
      
      this.isFavoritesView = isFavorites;
      console.log('Is favorites view:', this.isFavoritesView);
    });
    
    // Check if user is already logged in when component initializes
    const currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = !!currentUser;
    console.log('Initial auth state:', this.isLoggedIn);
    
    if (this.isLoggedIn) {
      this.loadFavorites();
    }
    
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      console.log('Auth state changed:', user);
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadFavorites();
      } else {
        this.favorites = [];
      }
    });
    
    // Set up timer to update relative times if in favorites view
    if (this.isFavoritesView) {
      setInterval(() => {
        // Force component to update times
        this.favorites = [...this.favorites];
      }, 60000); // Update every minute
    }
  }

  // Load user's favorites
  loadFavorites(): void {
    console.log('Loading favorites...');
    if (this.isFavoritesView) {
      this.favoritesLoading = true;
    }
    
    this.favoritesService.getFavorites().subscribe({
      next: (response) => {
        this.favorites = response.favorites || [];
        console.log('Loaded favorites:', this.favorites);
        
        // If in favorites view, sort by newest first
        if (this.isFavoritesView) {
          this.favorites.sort((a, b) => 
            new Date(b.addedAt || Date.now()).getTime() - 
            new Date(a.addedAt || Date.now()).getTime()
          );
          this.favoritesLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        if (err.status === 401 || err.status === 403) {
          this.isLoggedIn = false;
        }
        this.favoritesLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.artistName.trim()) return;
    console.log("Search initiated for:", this.artistName);
    this.loading = true;
    this.artists = [];
    this.searchPerformed = true;
    this.selectedArtist = null;
    
    // Clear previous selection for categories and similar artists
    this.selectedArtwork = null;
    this.categories = [];
    this.categoriesError = '';
    this.similarArtists = [];

    this.artistService.searchArtists(this.artistName.trim()).subscribe({
      next: (response: Artist[]) => {
        console.log('Search results:', response);
        this.artists = response;
        console.log('Artists loaded:', this.artists);
        console.log('First artist:', this.artists[0]);
        this.artists.forEach(artist => artist.isHovered = false);
      },
      error: (error: any) => {
        console.error('Error fetching artists:', error);
        this.artists = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onClear(): void {
    this.artistName = '';
    this.artists = [];
    this.searchPerformed = false;
    this.selectedArtist = null;
    this.selectedArtwork = null;
    this.categories = [];
    this.categoriesError = '';
    this.similarArtists = [];
  }

  getArtistThumbnail(artist: Artist): string {
    if (!artist.thumbnail || artist.thumbnail.includes('/assets/shared/missing_image.png')) {
      return 'assets/artsy_logo.svg';
    }
    return artist.thumbnail;
  }

  onSelectArtist(artist: Artist): void {
    this.artistService.getArtistDetails(artist.id).subscribe({
      next: (details: ArtistDetails) => {
        console.log("Received artist details:", details);
        if (details.biography) {
          details.biography = this.formatBiography(details.biography);
        }
        this.selectedArtist = details;
        this.activeTab = 'info';
        console.log("Selected artist ID:", details.id);
        // Fetch similar artists using the detailed Artsy ID
        this.fetchSimilarArtists(details.id);
      },
      error: (error: any) => {
        console.error('Error fetching artist details:', error);
      }
    });
  }
  
  // Helper method to process the biography text.
  formatBiography(bio: string | null | undefined): string {
    if (!bio) {
      return '';
    }
    let formatted = bio.replace(/\r\n/g, '\n').trim();
    formatted = formatted.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');
    return formatted;
  }

  // Method to check if an artist is in favorites
  isFavorite(artistId: string): boolean {
    if (!this.isLoggedIn || !this.favorites || !artistId) {
      return false;
    }
    console.log(`Checking if ${artistId} is favorite:`, this.favorites.some(fav => fav.artistId === artistId));
    return this.favorites.some(fav => fav.artistId === artistId);
  }

  // Modified: Added proper error handling for toggle favorite
  toggleFavorite(artist: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.isLoggedIn || !artist || !artist.id) {
      return;
    }
    
    console.log(`Toggling favorite for artist: ${artist.name} (${artist.id})`);
    
    if (this.isFavorite(artist.id)) {
      this.favorites = this.favorites.filter(fav => fav.artistId !== artist.id);
      console.log(`Removed ${artist.name} from favorites locally`);
      this.favoritesService.removeFavorite(artist.id).subscribe({
        next: () => {
          console.log(`${artist.name} removed from favorites in API`);
          this.showNotification('Removed from favorites', 'danger');

        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          if (err.status === 401 || err.status === 403) {
            this.isLoggedIn = false;
          } else {
            this.loadFavorites();
          }
        }
      });
    } else {
      const newFav = {
        artistId: artist.id,
        artistName: artist.name,
        thumbnail: artist.thumbnail || this.getArtistThumbnail(artist),
        addedAt: new Date()
      };
      this.favorites.push(newFav);
      console.log(`Added ${artist.name} to favorites locally`);
      this.favoritesService.addFavorite(newFav).subscribe({
        next: () => {
          console.log(`${artist.name} added to favorites in API`);
          this.showNotification('Added to favorites', 'success');

        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          if (err.status === 401 || err.status === 403) {
            this.isLoggedIn = false;
          } else {
            this.loadFavorites();
          }
        }
      });
    }
    
    // If in favorites view and removing a favorite, refresh the list
    if (this.isFavoritesView) {
      this.loadFavorites();
    }
  }

  // Method to remove from favorites in the favorites view
  removeFromFavorites(favorite: any, event: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.isLoggedIn || !favorite || !favorite.artistId) {
      return;
    }
    
    const artistId = favorite.artistId;
    const artistName = favorite.artistName || 'Selected artist';
    
    console.log(`Removing ${artistName} from favorites...`);
    
    // Update local state first for responsive UI
    this.favorites = this.favorites.filter(fav => fav.artistId !== artistId);
    
    // Then update on server
    this.favoritesService.removeFavorite(artistId).subscribe({
      next: () => {
        console.log(`${artistName} removed from favorites`);
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
        if (err.status === 401 || err.status === 403) {
          this.isLoggedIn = false;
        } else {
          // Reload favorites to sync with server state on error
          this.loadFavorites();
        }
      }
    });
  }

  // Added: Navigation method for similar artists
  navigateToArtist(artist: any): void {
    console.log('Navigate to artist:', artist);
    if (artist && artist.id) {
      // You can implement navigation logic here
      // For now, we'll just select the artist if it's available
      const matchingArtist = this.artists.find(a => a.id === artist.id);
      if (matchingArtist) {
        this.onSelectArtist(matchingArtist);
      } else {
        // If not in current list, fetch details directly
        this.artistService.getArtistDetails(artist.id).subscribe({
          next: (details: ArtistDetails) => {
            if (details.biography) {
              details.biography = this.formatBiography(details.biography);
            }
            this.selectedArtist = details;
            this.activeTab = 'info';
            this.fetchSimilarArtists(details.id);
          },
          error: (error: any) => {
            console.error('Error fetching artist details:', error);
          }
        });
      }
    }
  }

  // Click handler for favorite cards
  navigateToArtistDetails(artistId: string): void {
    if (!artistId) return;
    
    this.artistService.getArtistDetails(artistId).subscribe({
      next: (details: ArtistDetails) => {
        if (details.biography) {
          details.biography = this.formatBiography(details.biography);
        }
        this.selectedArtist = details;
        this.activeTab = 'info';
        this.fetchSimilarArtists(details.id);
      },
      error: (error: any) => {
        console.error('Error fetching artist details:', error);
      }
    });
  }

  // NEW: Method to fetch similar artists for a given artist ID
  fetchSimilarArtists(id: string): void {
    console.log('🔍 Fetching similar artists for ID:', id);
    this.http.get<any[]>(`http://localhost:3000/api/artist/similar/${id}`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          console.log('🎯 Similar artists response:', data);
          // Limit to 5 items
          this.similarArtists = data.slice(0, 5);
        },
        error: (err) => {
          console.error('❌ Error fetching similar artists:', err);
          this.similarArtists = [];
        }
      });
  }
  
  // Method to fetch and display categories for an artwork
  showCategories(artwork: any): void {
    console.log('Fetching categories for artwork:', artwork);
    this.selectedArtwork = artwork;
    this.categories = [];
    this.categoriesError = '';
    this.categoriesLoading = true;

    if (!artwork.id) {
      console.error('No artwork ID available');
      this.categoriesError = 'No artwork ID available';
      this.categoriesLoading = false;
      return;
    }

    // Initialize and show the modal
    const modalElement = document.getElementById('categoriesModal');
    if (modalElement) {
      const bootstrapModal = new bootstrap.Modal(modalElement);
      bootstrapModal.show();
    }

    this.artistService.getArtworkCategories(artwork.id).subscribe({
      next: (categories) => {
        console.log('Categories response:', categories);
        this.categories = categories;
        this.categoriesLoading = false;
        if (!categories.length) {
          this.categoriesError = 'No categories.';
        }
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.categoriesError = 'No categories.';
        this.categoriesLoading = false;
      }
    });
  }
  
  // Format relative time for display in favorites
  getRelativeTime(date: Date | string): string {
    if (!date) return '';
    
    const now = new Date();
    const addedTime = new Date(date);
    const diffSeconds = Math.floor((now.getTime() - addedTime.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`;
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  showNotification(message: string, type: 'success' | 'danger'): void {
    const id = this.notificationId++;
    this.notifications.push({ message, type, id });
  
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    }, 3000);
  }
  
  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
  dismissNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
  
}