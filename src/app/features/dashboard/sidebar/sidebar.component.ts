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
    { icon: 'users', label: 'Clients', route: '/dashboard/clients' },
    { icon: 'package', label: 'Products', route: '/dashboard/products', badge: 12 },
    { icon: 'supplier', label: 'Suppliers', route: '/dashboard/suppliers' },
    { icon: 'truck', label: 'Carriers', route: '/dashboard/carriers' },
    { icon: 'shipment', label: 'Shipments', route: '/dashboard/shipments' },
    { icon: 'warehouse', label: 'Warehouses', route: '/dashboard/warehouses' },
    { icon: 'inventory', label: 'Inventories', route: '/dashboard/inventories' },
    { icon: 'movement', label: 'Movements', route: '/dashboard/inventory-movements' },
    { icon: 'purchase', label: 'Purchase Orders', route: '/dashboard/purchase-orders' },
    { icon: 'sales', label: 'Sales Orders', route: '/dashboard/sales-orders' },
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
