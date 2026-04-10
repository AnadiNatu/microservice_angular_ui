import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.gaurd'; 
// \core\guards\auth.gaurd.ts
const routes: Routes = [
  { path: '', redirectTo: 'auth/home', pathMatch: 'full' },  // ✅ NO leading /
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: '**', redirectTo: 'auth/home' }  // ✅ NO leading /
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// Export routes for standalone usage (if needed in future)
export { routes };