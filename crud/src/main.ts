import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ErrorHandler, isDevMode, enableProdMode } from '@angular/core';

if (!isDevMode()) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    { provide: ErrorHandler },
  ],
}).catch((err) => console.error(err));
