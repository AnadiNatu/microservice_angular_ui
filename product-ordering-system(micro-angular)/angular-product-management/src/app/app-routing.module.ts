// src/app/app-routing.module.ts
import { NgModule }    from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.gaurd';

const routes: Routes = [
  {
    path      : '',
    redirectTo: 'auth/home',
    pathMatch : 'full'
  },
  {
    path        : 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path        : 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate : [AuthGuard],
    // Must match exactly the string stored in backend roles Set<String>
    data        : { role: 'ROLE_ADMIN' }
  },
  {
    path      : '**',
    redirectTo: 'auth/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

export { routes };