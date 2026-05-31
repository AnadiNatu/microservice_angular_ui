import { Component, OnInit, OnDestroy, AfterViewInit, DoCheck } from "@angular/core";
import { Router, NavigationStart, NavigationEnd, NavigationError } from "@angular/router";
import { filter } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    title = 'OrderFlow Pro - Angular 17';
  isLoading = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (event instanceof NavigationEnd) {
        this.isLoading = false;
      }
      if (event instanceof NavigationError) {
        this.isLoading = false;
        console.error('Navigation error:', event.error);
      }
    });
  }

  ngAfterViewInit(): void {}
  ngOnDestroy(): void {}
}