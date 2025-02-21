import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';

//import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './app/interceptor/auth.interceptor';
import {appConfig} from './app/app.config';
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
////import { appConfig } from './app/app.config';
//import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
// //providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
//provideAnimationsAsync(),
/*import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));*/
/*

{
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]*/
