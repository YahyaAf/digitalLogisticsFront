import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  count = signal(0);
  
  increment() {
    this.count.update(n => n + 1);
  }

  decrement(){
    this.count.update(n => n-1);
  }
}
