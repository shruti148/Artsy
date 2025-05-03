import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Define an interface for the user profile
export interface UserProfile {
  _id?: string;
  fullName: string;
  email: string;
  profileImageUrl: string;
  // Add other properties if needed (e.g., favorites, etc.)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Hold the current user profile; null if not logged in.
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Base URL for your backend endpoints
  private apiUrl = 'https://webhw3-angular-94534.wl.r.appspot.com';

  constructor(private http: HttpClient) {}

  /**
   * checkAuthState() can be used to perform an initial check 
   * to update the current user (e.g., when the app starts).
   */
  checkAuthState(): void {
    this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(response => {
        if (response && response.user) {
          // Set currentUser with user data received from backend
          this.currentUserSubject.next(response.user);
        } else {
          this.currentUserSubject.next(null);
        }
      }),
      catchError(error => {
        console.error('Error in checkAuthState:', error);
        this.currentUserSubject.next(null);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * login() sends credentials to the backend, receives a JWT cookie and user data,
   * then updates the current user.
   */
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        console.log('Login successful:', response);
        // Instead of response.user, check for response.email
        if (response && response.email) {
          this.currentUserSubject.next(response);
        }
      }),
      
      catchError(error => {
        console.error('Login error:', error);
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  /**
   * register() creates a new user and updates current user state if successful.
   */
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData, { withCredentials: true }).pipe(
      tap(response => {
        console.log('Registration successful:', response);
        if (response && response.email) {
          this.currentUserSubject.next(response);
        }
      }),
      
      catchError(error => {
        console.error('Registration error:', error);
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  /**
   * logout() clears the JWT cookie and resets the current user to null.
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log('Logout successful');
        this.currentUserSubject.next(null);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        return of(null);
      })
    );
  }

  /**
   * deleteAccount() deletes the current user's account and resets the current user.
   */
  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/account`, { withCredentials: true }).pipe(
      tap(() => {
        console.log('Account deletion successful');
        this.currentUserSubject.next(null);
      }),
      catchError(error => {
        console.error('Account deletion error:', error);
        return of(null);
      })
    );
  }

  /**
   * getUserProfile() retrieves the user profile from the backend and updates the current user.
   */
  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(response => {
        if (response && response.email) {
          this.currentUserSubject.next(response);
        }
      }),
      
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return of(null);
      })
    );
  }

  /**
   * Helper method to determine if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
  /**
 * getCurrentUser() returns the current user value from the BehaviorSubject
 */
getCurrentUser(): UserProfile | null {
  return this.currentUserSubject.value;
}
}
