import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { CoreModule } from './app/core/core.module';
import { JwtInterceptor } from './app/core/interceptor/jwt.interceptor';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(),
//     importProvidersFrom(CoreModule) // Main module that will be runned , {edittablr}
//   ]
// }).catch(err => console.error(err));

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
 
    // Register HttpClient with DI-based interceptor support
    provideHttpClient(withInterceptorsFromDi()),
 
    // JWT interceptor – attaches Bearer token + handles 401 refresh
    {
      provide   : HTTP_INTERCEPTORS,
      useClass  : JwtInterceptor,
      multi     : true,
    },
 
    importProvidersFrom(CoreModule),
  ]
}).catch(err => console.error(err));