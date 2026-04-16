import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Signal, SignalStats } from '../models/signal.model';

const WS_URL = 'ws://localhost:8000/ws/signals';
const RECONNECT_DELAY_MS = 5000;

@Injectable({ providedIn: 'root' })
export class SignalService {
  signals$ = new BehaviorSubject<Signal[]>([]);
  stats$   = new BehaviorSubject<SignalStats>({ total: 0, buys: 0, sells: 0, aggressive: 0 });
  connected$ = new BehaviorSubject<boolean>(false);
  newSignal$ = new Subject<Signal>();

  private ws: WebSocket | null = null;
  private pingInterval: any;

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  private connect() {
    this.ngZone.runOutsideAngular(() => {
      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          this.ngZone.run(() => this.connected$.next(true));
          // Send ping every 30s to keep alive
          this.pingInterval = setInterval(() => this.ws?.send('ping'), 30000);
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.ngZone.run(() => this.handleMessage(msg));
          } catch { /* ignore parse errors */ }
        };

        this.ws.onclose = () => {
          this.ngZone.run(() => this.connected$.next(false));
          clearInterval(this.pingInterval);
          setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
        };

        this.ws.onerror = () => {
          this.ws?.close();
        };
      } catch {
        setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
      }
    });
  }

  private handleMessage(msg: any) {
    if (msg.type === 'history') {
      this.signals$.next(msg.data as Signal[]);
      if (msg.stats) this.stats$.next(msg.stats);
    } else if (msg.type === 'signal') {
      const sig = msg.data as Signal;
      const current = this.signals$.getValue();
      this.signals$.next([sig, ...current]);
      this.newSignal$.next(sig);
      // Update stats
      const s = this.stats$.getValue();
      this.stats$.next({
        total: s.total + 1,
        buys:  sig.direction === 'BUY'  ? s.buys  + 1 : s.buys,
        sells: sig.direction === 'SELL' ? s.sells + 1 : s.sells,
        aggressive: sig.position_size === 'AGGRESSIVE' ? s.aggressive + 1 : s.aggressive,
      });
    }
  }
}
