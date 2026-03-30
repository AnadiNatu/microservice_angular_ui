import { Component, OnInit, OnDestroy, OnChanges, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, SimpleChanges } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnChanges, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {
  title = 'Product Ordering System';
  loading = false;

  constructor(private router: Router) {
    console.log('AppComponent: Constructor');
    
    // Router Events Subscription
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true;
        console.log('Navigation Started:', event.url);
      } else if (event instanceof NavigationEnd) {
        this.loading = false;
        console.log('Navigation Ended:', event.url);
      }
    });
  }

  // Lifecycle Hooks Implementation
  ngOnChanges(changes: SimpleChanges): void {
    console.log('AppComponent: ngOnChanges', changes);
  }

  ngOnInit(): void {
    console.log('AppComponent: ngOnInit');
  }

  ngDoCheck(): void {
    // console.log('AppComponent: ngDoCheck');
  }

  ngAfterContentInit(): void {
    console.log('AppComponent: ngAfterContentInit');
  }

  ngAfterContentChecked(): void {
    // console.log('AppComponent: ngAfterContentChecked');
  }

  ngAfterViewInit(): void {
    console.log('AppComponent: ngAfterViewInit');
  }

  ngAfterViewChecked(): void {
    // console.log('AppComponent: ngAfterViewChecked');
  }

  ngOnDestroy(): void {
    console.log('AppComponent: ngOnDestroy');
  }
}
