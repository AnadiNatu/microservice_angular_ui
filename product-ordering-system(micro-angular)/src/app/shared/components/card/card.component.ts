import { Component, Input, Output, EventEmitter, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="card h-100" [class.border-green]="isFeatured" [appHighlight]="isFeatured ? '#e8f5e9' : ''">
      <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">{{ title | titlecase }}</h5>
        @if (isFeatured) {
          <span class="badge bg-success">Featured</span>
        }
      </div>
      <div class="card-body">
        <ng-content select="[card-body]"></ng-content>
      </div>
      <div class="card-footer bg-transparent border-0">
        <button class="btn btn-sm btn-primary w-100" (click)="onActionClick($event)">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card { border-radius: 16px; }
  `]
})
export class CardComponent {
  // Input with transform
  @Input({ required: true }) title: string = '';
  @Input() actionLabel: string = 'View Details';
  
  // Input transformation using booleanAttribute (Angular 16.1+)
  @Input({ transform: booleanAttribute }) isFeatured: boolean = false;

  // Output with EventEmitter
  @Output() action = new EventEmitter<void>();

  onActionClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.action.emit();
  }
}
