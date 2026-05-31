import { Component, Input, Output, EventEmitter, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  /*
   - Required Input - Card title
   - Angular 16+ feature: required property*/
  @Input({ required: true }) title: string = '';

  /*Optional Input - Action button label*/
  @Input() actionLabel: string = 'View Details';

  /*
   - Input with Transform - Boolean attribute
   - Angular 16.1+ feature: transform function
   - Allows: <app-card isFeatured> instead of <app-card [isFeatured]="true">*/
  @Input({ transform: booleanAttribute }) isFeatured: boolean = false;

  /* Optional Input - Disable action button*/
  @Input() disableAction: boolean = false;

  /*
   - Output - Action button click event
   - Parent component can listen: (action)="handleAction()"*/
  @Output() action = new EventEmitter<void>();

  /*
   - Handle action button click
   - Demonstrates event propagation control*/
  onActionClick(event: MouseEvent): void {
    // Prevent event bubbling
    event.preventDefault();
    event.stopPropagation();

    // Emit event to parent
    this.action.emit();
    
    console.log('Card action clicked:', this.title);
  }

  /*Get card CSS classes dynamically*/
  getCardClasses(): string {
    return this.isFeatured ? 'card h-100 border-success shadow-sm' : 'card h-100';
  }
}
