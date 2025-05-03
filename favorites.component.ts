import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],  // Make sure this file exists or adjust/remove if necessary
  standalone: true,
  imports: [CommonModule]  // Add CommonModule here
})
export class FavoritesComponent {
  // Component properties/methods...
  favorites: any[] = [];
  loading: boolean = false;

  navigateToArtistDetails(artistId: string): void {
    // Your navigation logic...
    console.log('Navigating to artist details for ID:', artistId);
  }
}
