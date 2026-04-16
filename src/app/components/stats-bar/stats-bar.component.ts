import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SignalService } from '../../services/signal.service';
import { SignalStats } from '../../models/signal.model';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-bar.component.html',
  styleUrls: ['./stats-bar.component.scss'],
})
export class StatsBarComponent implements OnInit, OnDestroy {
  stats: SignalStats = { total: 0, buys: 0, sells: 0, aggressive: 0 };
  connected = false;
  currentTime = '';

  private timer: any;
  private subs = new Subscription();

  constructor(
    private signalService: SignalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subs.add(
      this.signalService.stats$.subscribe(s => {
        this.stats = s;
        this.cdr.detectChanges();
      })
    );

    this.subs.add(
      this.signalService.connected$.subscribe(c => {
        this.connected = c;
        this.cdr.detectChanges();
      })
    );

    this.updateTime();
    this.timer = setInterval(() => {
      this.updateTime();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.subs.unsubscribe();
  }

  private updateTime() {
    this.currentTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  }
}
