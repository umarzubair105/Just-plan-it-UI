import { Routes } from '@angular/router';
import {AuthGuard} from './interceptor/auth.guard';
//import { provideHttpClient, withInterceptors } from '@angular/common/http';
export const routes: Routes = [
  //{ path: '', component: AppComponent },  // Default route (home)
 // { path: 'company', component: CompanyComponent },
  // { path: 'admin', component: AdminComponent, canActivate: [RoleGuard], data: { role: 'ADMIN' } },
  { path: '', loadComponent: ()=>import(
      './components/home.component').then((m)=>m.HomeComponent)},
  { path: 'login', loadComponent: ()=>import(
      './components/login.component').then((m)=>m.LoginComponent)},
  { path: 'company', loadComponent: ()=>import(
    './components/company.component').then((m)=>m.CompanyComponent)},
  { path: 'resource/:companyId', loadComponent: ()=>import(
      './components/resource.component').then((m)=>m.ResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'product/:companyId', loadComponent: ()=>import(
      './components/product.component').then((m)=>m.ProductComponent),
    canActivate: [AuthGuard]},
  { path: 'upload-resource/:companyId', loadComponent: ()=>import(
      './components/upload.resource.component').then((m)=>m.UploadResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'mapping/:companyId', loadComponent: ()=>import(
      './components/mapping.component').then((m)=>m.MappingComponent),
    canActivate: [AuthGuard]},
  { path: 'upload-epic/:productId', loadComponent: ()=>import(
      './components/upload.epic.component').then((m)=>m.UploadEpicComponent),
    canActivate: [AuthGuard]},
  { path: 'priority/:companyId', loadComponent: ()=>import(
      './components/priority.component').then((m)=>m.PriorityComponent),
    canActivate: [AuthGuard]},
  { path: 'annual-leave', loadComponent: ()=>import(
      './annual-leave/annual-leave.component').then((m)=>m.AnnualLeaveComponent),
    canActivate: [AuthGuard]},
  { path: 'section', loadComponent: ()=>import(
      './components/section/section.component').then((m)=>m.SectionComponent),
    canActivate: [AuthGuard]},
  { path: 'home', redirectTo: '' },  // Catch-all route (redirect to home for invalid URLs)
  { path: '*', redirectTo: '' }  // Catch-all route (redirect to home for invalid URLs)

  //{ path: '', redirectTo: '/step1', pathMatch: 'full' }, // Default route
];
