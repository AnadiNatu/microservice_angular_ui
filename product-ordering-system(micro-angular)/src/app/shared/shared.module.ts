import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CardComponent } from './components/card/card.component';
import { LifecycleDemoComponent } from './components/lifecycle-demo/lifecycle-demo.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CustomCurrencyPipe } from './pipes/custom-currency.pipe';
import { HighlightDirective } from './directives/highlight.directive';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    CardComponent,
    LifecycleDemoComponent,
    ProfileComponent,
    CustomCurrencyPipe,
    HighlightDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    CardComponent,
    LifecycleDemoComponent,
    ProfileComponent,
    CustomCurrencyPipe,
    HighlightDirective
  ]
})
export class SharedModule { }
