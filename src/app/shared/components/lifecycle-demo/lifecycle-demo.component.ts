import { 
  Component, 
  OnInit, 
  OnDestroy, 
  OnChanges, 
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  SimpleChanges,
  Input
} from '@angular/core';

@Component({
  selector: 'app-lifecycle-demo',
  templateUrl: './lifecycle-demo.component.html',
  styleUrls: ['./lifecycle-demo.component.css'],
  standalone: true
})
export class LifecycleDemoComponent 
  implements OnInit, OnDestroy, OnChanges, DoCheck, 
             AfterContentInit, AfterContentChecked, 
             AfterViewInit, AfterViewChecked {

  @Input() demoData: string = 'Initial Data';

  lifecycleLogs: string[] = [];
  counter: number = 0;
  private intervalId: any;

  constructor() {
    this.log('🔧 constructor() - Component instance created');
  }

  /**
   * 2. ngOnChanges - Called when @Input properties change
   * Called before ngOnInit and whenever input-bound properties change
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.log('🔄 ngOnChanges() - Input properties changed');
    
    for (const propName in changes) {
      const change = changes[propName];
      this.log(`  - ${propName}: ${change.previousValue} → ${change.currentValue}`);
    }
  }

  /**
   * 3. ngOnInit - Called once after first ngOnChanges
   * Use for: Component initialization, HTTP calls, subscriptions
   * Best practice: Most initialization logic goes here
   */
  ngOnInit(): void {
    this.log('✅ ngOnInit() - Component initialized');
    
    // Example: Start a counter (simulating data updates)
    this.intervalId = setInterval(() => {
      this.counter++;
    }, 2000);
  }

  /**
   * 4. ngDoCheck - Called during every change detection cycle
   * Use for: Custom change detection logic
   * Warning: Called very frequently, keep logic minimal
   */
  ngDoCheck(): void {
    // Commented out to avoid log spam
    // this.log('🔍 ngDoCheck() - Change detection cycle');
  }

  /**
   * 5. ngAfterContentInit - Called once after content projection
   * Use for: Accessing projected content via @ContentChild
   */
  ngAfterContentInit(): void {
    this.log('📦 ngAfterContentInit() - Content projected');
  }

  /**
   * 6. ngAfterContentChecked - Called after every content check
   * Use for: Responding to projected content changes
   */
  ngAfterContentChecked(): void {
    // Commented out to avoid log spam
    // this.log('📦 ngAfterContentChecked() - Content checked');
  }

  /**
   * 7. ngAfterViewInit - Called once after view initialization
   * Use for: Accessing view children via @ViewChild, DOM manipulation
   */
  ngAfterViewInit(): void {
    this.log('👁️ ngAfterViewInit() - View initialized');
  }

  /**
   * 8. ngAfterViewChecked - Called after every view check
   * Use for: Responding to view changes
   */
  ngAfterViewChecked(): void {
    // Commented out to avoid log spam
    // this.log('👁️ ngAfterViewChecked() - View checked');
  }

  /**
   * 9. ngOnDestroy - Called just before component destruction
   * Use for: Cleanup - unsubscribe observables, clear timers, remove event listeners
   * Critical: Prevents memory leaks
   */
  ngOnDestroy(): void {
    this.log('🗑️ ngOnDestroy() - Component destroyed');
    
    // IMPORTANT: Clear interval to prevent memory leak
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.log('  - Interval cleared (memory leak prevented)');
    }
  }

  /**
   * Helper method to log lifecycle events
   */
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.lifecycleLogs.push(logEntry);
    
    // Keep only last 15 logs to prevent overflow
    if (this.lifecycleLogs.length > 15) {
      this.lifecycleLogs.shift();
    }
  }

  /**
   * Clear logs (for demo purposes)
   */
//   clearLogs(): void {
//     this.lifecycleLogs = [];
//   }
}
