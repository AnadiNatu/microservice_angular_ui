import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  template: `
    <app-header></app-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3 col-lg-2 d-none d-md-block p-0">
          <app-sidebar></app-sidebar>
        </div>
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {}
