import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SignalService } from '../../services/signal.service';
import { Signal } from '../../models/signal.model';
import { SignalBadgeComponent } from '../signal-badge/signal-badge.component';

@Component({
  selector: 'app-signal-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalBadgeComponent],
  templateUrl: './signal-table.component.html',
  styleUrls: ['./signal-table.component.scss'],
})
export class SignalTableComponent implements OnInit, OnDestroy {
  allSignals: Signal[] = [];
  filtered: Signal[] = [];
  flashIds = new Set<string>();
  prices: Record<string, number> = {};

  filterDirection = 'ALL';
  filterStrategy  = 'ALL';
  filterSize      = 'ALL';
  filterType      = 'ALL';
  strategies: string[] = [];

  private subs = new Subscription();

  constructor(
    private signalService: SignalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subs.add(
      this.signalService.signals$.subscribe(signals => {
        this.allSignals = signals;
        this.buildStrategyList();
        this.applyFilters();
        this.cdr.detectChanges();
      })
    );

    this.subs.add(
      this.signalService.newSignal$.subscribe(sig => {
        this.flashIds.add(sig.id);
        this.cdr.detectChanges();
        setTimeout(() => {
          this.flashIds.delete(sig.id);
          this.cdr.detectChanges();
        }, 3000);
      })
    );

    this.subs.add(
      this.signalService.prices$.subscribe(p => {
        this.prices = p;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  private buildStrategyList() {
    const set = new Set(this.allSignals.map(s => s.strategy));
    this.strategies = Array.from(set);
  }

  applyFilters() {
    this.filtered = this.allSignals.filter(s => {
      if (this.filterDirection !== 'ALL' && s.direction !== this.filterDirection) return false;
      if (this.filterStrategy  !== 'ALL' && s.strategy  !== this.filterStrategy)  return false;
      if (this.filterSize      !== 'ALL' && s.position_size !== this.filterSize)   return false;
      if (this.filterType      !== 'ALL' && s.instrument_type !== this.filterType) return false;
      return true;
    });
  }

  clearFilters() {
    this.filterDirection = 'ALL';
    this.filterStrategy  = 'ALL';
    this.filterSize      = 'ALL';
    this.filterType      = 'ALL';
    this.applyFilters();
  }

  trackById(_: number, sig: Signal): string { return sig.id; }

  formatPrice(p: number): string {
    return p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  riskPoints(sig: Signal): string {
    return Math.abs(sig.entry - sig.stop_loss).toFixed(2);
  }

  getLivePrice(ticker: string): number | null {
    return this.prices[ticker] ?? null;
  }

  livePriceClass(sig: Signal): string {
    const p = this.getLivePrice(sig.ticker);
    if (p === null) return 'loading';
    if (sig.direction === 'BUY')  return p >= sig.entry ? 'above' : 'below';
    if (sig.direction === 'SELL') return p <= sig.entry ? 'above' : 'below';
    return 'near';
  }
}
