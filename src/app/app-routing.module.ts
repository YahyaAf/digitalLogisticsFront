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
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
