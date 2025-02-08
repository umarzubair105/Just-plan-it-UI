import { Routes } from '@angular/router';
import {AuthGuard} from './interceptor/auth.guard';
//import { provideHttpClient, withInterceptors } from '@angular/common/http';
export const routes: Routes = [
  //{ path: '', component: AppComponent },  // Default route (home)
 // { path: 'company', component: CompanyComponent },
  // { path: 'admin', component: AdminComponent, canActivate: [RoleGuard], data: { role: 'ADMIN' } },
  { path: 'login', loadComponent: ()=>import(
      './components/login.component').then((m)=>m.LoginComponent)},
  { path: 'company', loadComponent: ()=>import(
    './components/company.component').then((m)=>m.CompanyComponent),
    canActivate: [AuthGuard]},
  { path: 'resource/:companyId', loadComponent: ()=>import(
      './components/resource.component').then((m)=>m.ResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'product/:companyId', loadComponent: ()=>import(
      './components/product.component').then((m)=>m.ProductComponent) },
  { path: 'upload-resource/:companyId', loadComponent: ()=>import(
      './components/upload.resource.component').then((m)=>m.UploadResourceComponent) },
  { path: 'mapping/:companyId', loadComponent: ()=>import(
      './components/mapping.component').then((m)=>m.MappingComponent) },
  { path: 'upload-epic/:productId', loadComponent: ()=>import(
      './components/upload.epic.component').then((m)=>m.UploadEpicComponent) },
  { path: 'priority/:companyId', loadComponent: ()=>import(
      './components/priority.component').then((m)=>m.PriorityComponent) },
  { path: 'section', loadComponent: ()=>import(
      './components/section/section.component').then((m)=>m.SectionComponent) },
  //{ path: '11*', redirectTo: '' }  // Catch-all route (redirect to home for invalid URLs)

  //{ path: '', redirectTo: '/step1', pathMatch: 'full' }, // Default route
];
