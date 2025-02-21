import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptor/auth.interceptor';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    ]
  //providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
  //
};




