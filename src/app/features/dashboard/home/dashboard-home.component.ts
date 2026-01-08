import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  standalone: false,
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent {
  stats = [
    { 
      title: 'Total Orders', 
      value: '1,544', 
      change: '+12.5%', 
      isPositive: true,
      icon: 'clipboard',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Revenue', 
      value: '$45,231', 
      change: '+8.2%', 
      isPositive: true,
      icon: 'dollar',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Shipments', 
      value: '2,487', 
      change: '+5.7%', 
      isPositive: true,
      icon: 'truck',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'Active Users', 
      value: '892', 
      change: '-2.4%', 
      isPositive: false,
      icon: 'users',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  recentOrders = [
    { id: '#12345', client: 'John Doe', product: 'Product A', status: 'Delivered', amount: '$250' },
    { id: '#12346', client: 'Jane Smith', product: 'Product B', status: 'In Transit', amount: '$180' },
    { id: '#12347', client: 'Bob Wilson', product: 'Product C', status: 'Processing', amount: '$420' },
    { id: '#12348', client: 'Alice Brown', product: 'Product D', status: 'Delivered', amount: '$350' },
    { id: '#12349', client: 'Charlie Davis', product: 'Product E', status: 'Pending', amount: '$190' },
  ];

  getStatusClass(status: string): string {
    switch(status) {
      case 'Delivered': return 'bg-green-500/10 text-green-500';
      case 'In Transit': return 'bg-blue-500/10 text-blue-500';
      case 'Processing': return 'bg-yellow-500/10 text-yellow-500';
      case 'Pending': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  }
}
