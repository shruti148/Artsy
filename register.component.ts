import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink]
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  register(): void {
    // Clear any existing error messages
    this.errorMessage = '';

    // Client-side validation
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    // Prepare the registration data payload
    const payload = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
    };

    // Send a POST request to the backend registration endpoint
    this.http.post('http://localhost:3000/api/register', payload).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        // Optionally, navigate to the login page upon successful registration
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        // Display the error message returned by the backend, if any
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
      },
    });
  }
}
