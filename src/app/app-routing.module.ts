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
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sales-orders', component: SalesOrdersComponent, canActivate: [authGuard] },
  { 
    path: 'dashboard', 
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardHomeComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'users', component: UsersComponent },
      { path: 'warehouses', component: WarehousesComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventories', component: InventoriesComponent },
      { path: 'inventory-movements', component: InventoryMovementsComponent },
      { path: 'purchase-orders', component: PurchaseOrdersComponent },
      { path: 'sales-orders', component: DashboardSalesOrdersComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
