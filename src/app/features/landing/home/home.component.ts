import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  stats = signal([
    { icon: 'truck', value: '50k+', label: 'Successful Transportation', color: 'orange' },
    { icon: 'box', value: '256', label: 'Total Freight Transportation', color: 'blue' },
    { icon: 'globe', value: '25+', label: 'Countries of Operation', color: 'green' },
    { icon: 'building', value: '125', label: 'Total Freight Transportation', color: 'purple' }
  ]);

  services = signal([
    {
      title: 'Maritime Freight Transportation',
      description: 'Logisco Air freight service deliver the knowledge & opportunity to optimize every mile at knowledge',
      icon: 'ship',
      badge: 'SERVICE ONE'
    },
    {
      title: 'Land Freight Transportation',
      description: 'Logisco Air freight service deliver the knowledge & opportunity to optimize every mile at knowledge',
      icon: 'truck',
      badge: 'SERVICE TWO'
    },
    {
      title: 'Train Freight Transportation',
      description: 'Logisco Air freight service deliver the knowledge & opportunity to optimize every mile at knowledge',
      icon: 'train',
      badge: 'SERVICE THREE'
    }
  ]);

  features = signal([
    { icon: 'shield', text: 'Intermodal Shipping' },
    { icon: 'check', text: 'Frozen Product Shipping' },
    { icon: 'truck', text: 'Just Slot Trucking' },
    { icon: 'package', text: 'Container Freight' },
    { icon: 'plane', text: 'Intermodal Shipping' },
    { icon: 'warehouse', text: 'Flatbed Shipping' }
  ]);

  constructor(private router: Router) {}

  ngOnInit(): void {}

  getQuote(): void {
    this.router.navigate(['/contact']);
  }

  learnMore(): void {
    this.router.navigate(['/services']);
  }
}
