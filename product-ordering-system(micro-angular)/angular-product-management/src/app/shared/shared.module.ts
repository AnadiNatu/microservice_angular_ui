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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // ✅ Import standalone components
    HeaderComponent,
    SidebarComponent,
    CardComponent,
    ProfileComponent,
    LifecycleDemoComponent,
    HighlightDirective,
    CustomCurrencyPipe
  ],
  exports: [
    // Export Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // ✅ Export standalone components
    HeaderComponent,
    SidebarComponent,
    CardComponent,
    ProfileComponent,
    LifecycleDemoComponent,
    HighlightDirective,
    CustomCurrencyPipe
  ]
})
export class SharedModule {}