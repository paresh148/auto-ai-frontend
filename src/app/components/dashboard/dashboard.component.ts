import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsBarComponent } from '../stats-bar/stats-bar.component';
import { SignalTableComponent } from '../signal-table/signal-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsBarComponent, SignalTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {}
