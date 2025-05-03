import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  // <-- Added import
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';

  // Inject AuthService and Router
  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    console.log('Logging in with:', this.email, this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Navigate to a dashboard or home page after successful login
        this.router.navigate(['/search']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Optionally, show an error message to the user here
      }
    });
  }
}
