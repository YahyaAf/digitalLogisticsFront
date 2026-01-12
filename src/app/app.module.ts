import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout.component';
import { DashboardHomeComponent } from './features/dashboard/home/dashboard-home.component';
import { SidebarComponent } from './features/dashboard/sidebar/sidebar.component';
import { SuppliersComponent } from './features/dashboard/suppliers/suppliers.component';
import { UsersComponent } from './features/dashboard/users/users.component';
import { WarehousesComponent } from './features/dashboard/warehouses/warehouses.component';
import { ClientsComponent } from './features/dashboard/clients/clients.component';
import { ProductsComponent } from './features/dashboard/products/products.component';
import { InventoriesComponent } from './features/dashboard/inventories/inventories.component';
import { InventoryMovementsComponent } from './features/dashboard/inventory-movements/inventory-movements.component';
import { PurchaseOrdersComponent } from './features/dashboard/purchase-orders/purchase-orders.component';
import { HeaderComponent } from './features/landing/header/header.component';
import { FooterComponent } from './features/landing/footer/footer.component';
import { HomeComponent } from './features/landing/home/home.component';
import { authInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardLayoutComponent,
    DashboardHomeComponent,
    SidebarComponent,
    SuppliersComponent,
    UsersComponent,
    WarehousesComponent,
    ClientsComponent,
    ProductsComponent,
    InventoriesComponent,
    InventoryMovementsComponent,
    PurchaseOrdersComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
