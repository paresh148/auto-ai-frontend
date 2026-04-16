import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signal-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="type">{{ label }}</span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;

      &.buy        { background: #0d2b1e; color: #3fb950; border: 1px solid #238636; }
      &.sell       { background: #2b0d0d; color: #f85149; border: 1px solid #da3633; }
      &.aggressive { background: #1e1b0d; color: #e3b341; border: 1px solid #9e6a03; }
      &.normal     { background: #161b22; color: #79c0ff; border: 1px solid #1f6feb; }
      &.reduced    { background: #161b22; color: #6e7681; border: 1px solid #30363d; }
      &.gap        { background: #1b1b2b; color: #bc8cff; border: 1px solid #6e40c9; }
      &.shift      { background: #1b2b2b; color: #56d364; border: 1px solid #238636; }
      &.index      { background: #0d1e2b; color: #79c0ff; border: 1px solid #1f6feb; }
      &.stock      { background: #1b1b1b; color: #8b949e; border: 1px solid #30363d; }
      &.commodity  { background: #2b1e0d; color: #e3b341; border: 1px solid #9e6a03; }
    }
  `],
})
export class SignalBadgeComponent {
  @Input() label = '';
  @Input() type = '';
}
