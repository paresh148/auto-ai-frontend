import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Signal, SignalStats } from '../models/signal.model';

const WS_URL        = 'ws://localhost:8000/ws/signals';
const API_URL       = 'http://localhost:8000/api/prices';
const RECONNECT_MS  = 5000;
const PRICE_POLL_MS = 30000;

@Injectable({ providedIn: 'root' })
export class SignalService {
  signals$   = new BehaviorSubject<Signal[]>([]);
  stats$     = new BehaviorSubject<SignalStats>({ total: 0, buys: 0, sells: 0, aggressive: 0 });
  connected$ = new BehaviorSubject<boolean>(false);
  prices$    = new BehaviorSubject<Record<string, number>>({});
  newSignal$ = new Subject<Signal>();

  private ws: WebSocket | null = null;
  private pingInterval: any;

  constructor() {
    this.connect();
    this.fetchPrices();
    setInterval(() => this.fetchPrices(), PRICE_POLL_MS);
  }

  // ── WebSocket ────────────────────────────────────────────────────────────
  private connect() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.connected$.next(true);
        this.pingInterval = setInterval(() => this.ws?.send('ping'), 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch { }
      };

      this.ws.onclose = () => {
        this.connected$.next(false);
        clearInterval(this.pingInterval);
        setTimeout(() => this.connect(), RECONNECT_MS);
      };

      this.ws.onerror = () => this.ws?.close();

    } catch {
      setTimeout(() => this.connect(), RECONNECT_MS);
    }
  }

  private handleMessage(msg: any) {
    if (msg.type === 'history') {
      this.signals$.next(msg.data as Signal[]);
      if (msg.stats) this.stats$.next(msg.stats);

    } else if (msg.type === 'signal') {
      const sig = msg.data as Signal;
      this.signals$.next([sig, ...this.signals$.getValue()]);
      this.newSignal$.next(sig);
      const s = this.stats$.getValue();
      this.stats$.next({
        total:      s.total + 1,
        buys:       sig.direction === 'BUY'            ? s.buys      + 1 : s.buys,
        sells:      sig.direction === 'SELL'           ? s.sells     + 1 : s.sells,
        aggressive: sig.position_size === 'AGGRESSIVE' ? s.aggressive + 1 : s.aggressive,
      });
    }
  }

  // ── Price polling ────────────────────────────────────────────────────────
  private fetchPrices() {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => { if (data?.prices) this.prices$.next(data.prices); })
      .catch(() => { });
  }
}
