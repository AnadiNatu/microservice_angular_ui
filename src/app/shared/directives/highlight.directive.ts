import { Directive, ElementRef, HostListener, Input, HostBinding } from '@angular/core';


@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  /*
   -Input property - color to use for highlighting
   -Can be set via: [appHighlight]="'red'" or [appHighlight]="colorVariable"*/
  @Input('appHighlight') highlightColor: string = '';

  /*
   - HostBinding - Binds directive property to host element property
   - This creates reactive binding: backgroundColor automatically updates*/
  @HostBinding('style.backgroundColor') 
  backgroundColor: string = '';

  /*HostBinding for smooth transitions*/
  @HostBinding('style.transition') 
  transition: string = 'background-color 0.3s ease, transform 0.2s ease';

  /*HostBinding for hover effect*/
  @HostBinding('style.cursor')
  cursor: string = 'pointer';

  /*
   - ElementRef gives direct access to the DOM element
   - Use sparingly - prefer @HostBinding/@HostListener*/
  constructor(private el: ElementRef) {
    console.log('HighlightDirective initialized on element:', el.nativeElement.tagName);
  }

  /*
   - HostListener - Listens to host element events
   - Responds to mouseenter event*/
  @HostListener('mouseenter') 
  onMouseEnter(): void {
    this.highlight(this.highlightColor || '#f0f7ff');
    this.el.nativeElement.style.transform = 'scale(1.02)';
  }

  /*HostListener for mouseleave event*/
  @HostListener('mouseleave') 
  onMouseLeave(): void {
    this.highlight('');
    this.el.nativeElement.style.transform = 'scale(1)';
  }

  /*Private method to apply highlight*/
  private highlight(color: string): void {
    this.backgroundColor = color;
  }
}