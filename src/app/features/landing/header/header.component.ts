import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;
  isAuthenticated = false;
  currentRoute = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.currentRoute = this.router.url;
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  checkAuthentication(): void {
    const token = localStorage.getItem('access_token');
    this.isAuthenticated = !!token;
  }

  isClient(): boolean {
    return this.authService.isClient();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.mobileMenuOpen = false;
  }

  logout(): void {
    // Clear tokens immediately
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticated = false;
    
    // Close mobile menu if open
    this.mobileMenuOpen = false;
    
    // Navigate to home
    this.router.navigate(['/']).then(() => {
      // Reload to ensure clean state
      window.location.reload();
    });
  }
}
