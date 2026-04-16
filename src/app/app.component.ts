import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `<app-dashboard></app-dashboard>`,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AppComponent implements OnInit {
  ngOnInit() {
    // Auto-reload every 30 seconds to ensure latest signals are visible
    setInterval(() => window.location.reload(), 30000);
  }
}
