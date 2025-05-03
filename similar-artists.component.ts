// src/app/pages/artist-detail/similar-artists.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-similar-artists',
  templateUrl: './similar-artists.component.html',
  styleUrls: ['./similar-artists.component.css'],
  standalone: true,
  imports: [CommonModule]  // Needed for *ngIf, *ngFor inside this template
})
export class SimilarArtistsComponent implements OnInit {
  @Input() artistId!: string;  // This defines the input property

  similarArtists: any[] = [];
  loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
    console.log('SimilarArtistsComponent initialized with artistId:', this.artistId);
    // Implement your logic to fetch similar artists using this.artistId.
  }
}
