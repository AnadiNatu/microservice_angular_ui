import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.gaurd';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'auth/home',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard],
    data: {
      role: 'ADMIN'
    }
  },

  {
    path: '**',
    redirectTo: 'auth/home'
  }

];