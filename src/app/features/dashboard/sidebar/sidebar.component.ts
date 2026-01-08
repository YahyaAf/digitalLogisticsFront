import { Component, Input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = true;

  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Dashboard', route: '/dashboard/home' },
    { icon: 'chart', label: 'Analytics', route: '/dashboard/analytics' },
    { icon: 'users', label: 'Clients', route: '/dashboard/clients' },
    { icon: 'package', label: 'Products', route: '/dashboard/products', badge: 12 },
    { icon: 'supplier', label: 'Suppliers', route: '/dashboard/suppliers' },
    { icon: 'truck', label: 'Shipments', route: '/dashboard/shipments' },
    { icon: 'warehouse', label: 'Warehouses', route: '/dashboard/warehouses' },
    { icon: 'clipboard', label: 'Orders', route: '/dashboard/orders', badge: 5 },
    { icon: 'users-cog', label: 'Users', route: '/dashboard/users' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
