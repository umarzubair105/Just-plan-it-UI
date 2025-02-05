import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CompanyComponent } from './components/company.component';

export const routes: Routes = [
  //{ path: '', component: AppComponent },  // Default route (home)
 // { path: 'company', component: CompanyComponent },
  { path: 'company', loadComponent: ()=>import(
    './components/company.component').then((m)=>m.CompanyComponent) },
  { path: 'resource/:companyId', loadComponent: ()=>import(
      './components/resource.component').then((m)=>m.ResourceComponent) },
  { path: 'product/:companyId', loadComponent: ()=>import(
      './components/product.component').then((m)=>m.ProductComponent) },
  { path: 'upload-epic/:productId', loadComponent: ()=>import(
      './components/upload.epic.component').then((m)=>m.UploadEpicComponent) },
  { path: 'priority/:companyId', loadComponent: ()=>import(
      './components/priority.component').then((m)=>m.PriorityComponent) },
  { path: 'section', loadComponent: ()=>import(
      './components/section/section.component').then((m)=>m.SectionComponent) },
  //{ path: '11*', redirectTo: '' }  // Catch-all route (redirect to home for invalid URLs)

  //{ path: '', redirectTo: '/step1', pathMatch: 'full' }, // Default route
];
