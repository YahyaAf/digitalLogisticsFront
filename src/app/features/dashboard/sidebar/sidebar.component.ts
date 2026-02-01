import { Component, Input, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  roles?: string[]; // Roles allowed to see this menu item
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = true;

  allMenuItems: MenuItem[] = [
    { icon: 'home', label: 'Dashboard', route: '/dashboard/home', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'users-cog', label: 'Users', route: '/dashboard/users', roles: ['ADMIN'] },
    { icon: 'users', label: 'Clients', route: '/dashboard/clients', roles: ['ADMIN'] },
    { icon: 'package', label: 'Products', route: '/dashboard/products', badge: 12, roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'supplier', label: 'Suppliers', route: '/dashboard/suppliers', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'purchase', label: 'Purchase Orders', route: '/dashboard/purchase-orders', roles: ['ADMIN'] },
    { icon: 'truck', label: 'Carriers', route: '/dashboard/carriers', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'warehouse', label: 'Warehouses', route: '/dashboard/warehouses', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'inventory', label: 'Inventories', route: '/dashboard/inventories', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'movement', label: 'Movements', route: '/dashboard/inventory-movements', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'sales', label: 'Sales Orders', route: '/dashboard/sales-orders', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    { icon: 'shipment', label: 'Shipments', route: '/dashboard/shipments', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
  ];

  // Computed signal qui réagit automatiquement aux changements de currentUser
  menuItems = computed(() => {
    const user = this.authService.currentUser();
    const userRole = this.authService.getUserRole();
    
    console.log('Sidebar: currentUser changed, role =', userRole);
    
    if (!userRole) {
      console.log('Sidebar: No role yet, showing empty menu');
      return [];
    }
    
    const filtered = this.allMenuItems.filter(item => 
      !item.roles || item.roles.includes(userRole)
    );
    
    console.log('Sidebar: Filtered menu items:', filtered.length, 'items for role', userRole);
    return filtered;
  });

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
