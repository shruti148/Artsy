import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, UserProfile } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  fullName: string = 'Guest';
  profileImageUrl: string = 'assets/default_profile.png';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to currentUser$ to update header variables when user logs in or out.
    this.authService.currentUser$.subscribe((user: UserProfile | null) => {
      if (user) {
        this.isLoggedIn = true;
        this.fullName = user.fullName;
        this.profileImageUrl = user.profileImageUrl;
      } else {
        this.isLoggedIn = false;
        this.fullName = 'Guest';
        this.profileImageUrl = 'assets/default_profile.png';
      }
    });
    
    // On app initialization, re-check the user's profile (if there's a valid JWT)
    this.authService.getUserProfile().subscribe();
  }

  // Navigates to the search page.
  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }

  // Calls AuthService to log out, then navigates to search.
  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/search']);
    });
  }

  // Calls AuthService to delete account, then navigates to search.
  deleteAccount(): void {
    this.authService.deleteAccount().subscribe(() => {
      this.router.navigate(['/search']);
    });
  }
}
