import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './guards/auth.gaurd';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';



@NgModule({
  imports: [CommonModule],
  providers: [
    AuthService,
    StorageService,
    AuthGuard
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule ONLY.');
    }
  }
}