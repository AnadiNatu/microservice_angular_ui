import { Component, OnInit, OnDestroy, Injectable, Directive, HostBinding } from '@angular/core';

// Component Inheritance Demo
@Directive()
export abstract class BaseComponent implements OnInit, OnDestroy {
  protected componentName: string = 'Base';

  ngOnInit() {
    console.log(`${this.componentName} initialized`);
  }

  ngOnDestroy() {
    console.log(`${this.componentName} destroyed`);
  }
}

@Component({
  selector: 'app-lifecycle-demo',
  template: `
    <div class="card p-4 mt-4" [appHighlight]="'#fff9c4'">
      <h5 class="fw-bold">Lifecycle & Inheritance Demo</h5>
      <p>Check console for lifecycle hook logs.</p>
      <div class="alert alert-info py-2 small">
        Component: {{ componentName }}
      </div>
      <button class="btn btn-sm btn-outline-primary" (click)="toggle()">Toggle State</button>
      @if (show) {
        <p class="mt-2 text-success animate-fade-in">State is active!</p>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class LifecycleDemoComponent extends BaseComponent implements OnInit {
  override componentName = 'LifecycleDemo';
  show = false;

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    console.log('LifecycleDemoComponent: Specific Init Logic');
  }

  toggle() {
    this.show = !this.show;
  }
}
