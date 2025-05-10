import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';

// Enable production mode when the environment is production
if (environment.production) {
  enableProdMode();
}

const bootstrap = () => {
  if (typeof document === 'undefined') {
    // Server-side rendering
    return bootstrapApplication(AppComponent, {
      providers: [
        provideServerRendering(),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimations()
      ]
    }).catch((err: any) => console.error(err));
  }
  
  // Client-side rendering
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      provideAnimations()
    ]
  }).catch((err: any) => console.error(err));
};

bootstrap();