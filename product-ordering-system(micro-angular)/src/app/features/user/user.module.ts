import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserLayoutComponent } from './user-layout.component';
import { UserProductListComponent } from './product-list/product-list.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { ProfileComponent } from '../../shared/components/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'products', component: UserProductListComponent },
      { path: 'my-orders', component: MyOrdersComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    UserLayoutComponent,
    UserProductListComponent,
    MyOrdersComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
