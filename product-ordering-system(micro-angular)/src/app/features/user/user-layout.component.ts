import { Component } from '@angular/core';

@Component({
  selector: 'app-user-layout',
  template: `
    <app-header></app-header>
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-3 mb-4">
          <app-sidebar></app-sidebar>
        </div>
        <div class="col-lg-9">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class UserLayoutComponent {}
