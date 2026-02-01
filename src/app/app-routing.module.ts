import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout.component';
import { DashboardHomeComponent } from './features/dashboard/home/dashboard-home.component';
import { SuppliersComponent } from './features/dashboard/suppliers/suppliers.component';
import { UsersComponent } from './features/dashboard/users/users.component';
import { WarehousesComponent } from './features/dashboard/warehouses/warehouses.component';
import { ClientsComponent } from './features/dashboard/clients/clients.component';
import { ProductsComponent } from './features/dashboard/products/products.component';
import { InventoriesComponent } from './features/dashboard/inventories/inventories.component';
import { InventoryMovementsComponent } from './features/dashboard/inventory-movements/inventory-movements.component';
import { PurchaseOrdersComponent } from './features/dashboard/purchase-orders/purchase-orders.component';
import { HomeComponent } from './features/landing/home/home.component';
import { SalesOrdersComponent } from './features/landing/sales-orders/sales-orders.component';
import { DashboardSalesOrdersComponent } from './features/dashboard/sales-orders/sales-orders.component';
import { ShipmentsComponent } from './features/dashboard/shipments/shipments.component';
import { CarriersComponent } from './features/dashboard/carriers/carriers.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { loginGuard } from './core/guards/login.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { 
    path: 'sales-orders', 
    component: SalesOrdersComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] }
  },
  { 
    path: 'dashboard', 
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { 
        path: 'home', 
        component: DashboardHomeComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'suppliers', 
        component: SuppliersComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'users', 
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'warehouses', 
        component: WarehousesComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'clients', 
        component: ClientsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'products', 
        component: ProductsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'inventories', 
        component: InventoriesComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'inventory-movements', 
        component: InventoryMovementsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'purchase-orders', 
        component: PurchaseOrdersComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'sales-orders', 
        component: DashboardSalesOrdersComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'shipments', 
        component: ShipmentsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
      { 
        path: 'carriers', 
        component: CarriersComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
