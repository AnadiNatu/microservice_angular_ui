import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module'; 
import { AppComponent } from './app.component';

// Import Core and Shared modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular Core Modules
    BrowserModule,
    HttpClientModule,
    
    // Application Modules
    CoreModule,      // Import once - contains singleton services
    SharedModule,    // Can be imported by feature modules
    
    // Routing (must be last)
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }