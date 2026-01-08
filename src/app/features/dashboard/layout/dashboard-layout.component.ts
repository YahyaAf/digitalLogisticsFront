import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  isSidebarOpen = signal(true);

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }
}
