import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CardComponent } from "./components/card/card.component";
import { HighlightDirective } from "./directives/highlight.directive";
import { CustomCurrencyPipe } from "./pipes/custom-currency.pipe";
import { HeaderComponent } from "./components/header/header.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { LifecycleDemoComponent } from "./components/lifecycle-demo/lifecycle-demo.component";

@NgModule({
  declarations: [
    // Components
    HeaderComponent,
    SidebarComponent,
    CardComponent,
    ProfileComponent,
    LifecycleDemoComponent,
    
    // Directives
    HighlightDirective,
    
    // Pipes
    CustomCurrencyPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    // Export common modules for convenience
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Export all shared components
    HeaderComponent,
    SidebarComponent,
    CardComponent,
    ProfileComponent,
    LifecycleDemoComponent,
    
    // Export directives
    HighlightDirective,
    
    // Export pipes
    CustomCurrencyPipe
  ]
})
export class SharedModule { }