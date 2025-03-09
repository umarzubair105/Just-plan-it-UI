import { Routes } from '@angular/router';
import {AuthGuard} from './interceptor/auth.guard';
import {TeamResourceComponent} from './team/team-resource.component';
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
  { path: 'upload-resource', loadComponent: ()=>import(
      './components/upload.resource.component').then((m)=>m.UploadResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'mapping-roles-designation', loadComponent: ()=>import(
      './components/mapping.component').then((m)=>m.MappingComponent),
    canActivate: [AuthGuard]},
  { path: 'company-calendar', loadComponent: ()=>import(
      './leaves/company-calendar.component').then((m)=>m.CompanyCalendarComponent),
    canActivate: [AuthGuard]},
  { path: 'product', loadComponent: ()=>import(
      './components/product.component').then((m)=>m.ProductComponent),
    canActivate: [AuthGuard]},
  { path: 'upload-epic/:productId', loadComponent: ()=>import(
      './components/upload.epic.component').then((m)=>m.UploadEpicComponent),
    canActivate: [AuthGuard]},
  { path: 'team-resource/:productId', loadComponent: ()=>import(
      './team/team-resource.component').then((m)=>m.TeamResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'product-resource/:productId', loadComponent: ()=>import(
      './team/product-resource.component').then((m)=>m.ProductResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'priority/:productId', loadComponent: ()=>import(
      './components/priority.component').then((m)=>m.PriorityComponent),
    canActivate: [AuthGuard]},
  { path: 'planning/:productId', loadComponent: ()=>import(
      './planning/planning.component').then((m)=>m.PlanningComponent),
    canActivate: [AuthGuard]},
  { path: 'epic-estimate', loadComponent: ()=>import(
      './planning/epic-estimate.component').then((m)=>m.EpicEstimateComponent),
    canActivate: [AuthGuard]},
  { path: 'resource-leave/:resourceId', loadComponent: ()=>import(
      './leaves/resource.leave.component').then((m)=>m.ResourceLeaveComponent),
    canActivate: [AuthGuard]},
  { path: 'planned-release/:productId', loadComponent: ()=>import(
      './planning/release.component').then((m)=>m.ReleaseComponent),
    canActivate: [AuthGuard]},
  { path: 'resource', loadComponent: ()=>import(
      './components/resource.component').then((m)=>m.ResourceComponent),
    canActivate: [AuthGuard]},
  { path: 'section', loadComponent: ()=>import(
      './components/section/sub-component.component').then((m)=>m.SubComponentComponent),
    canActivate: [AuthGuard]},
  { path: 'home', redirectTo: '' },  // Catch-all route (redirect to home for invalid URLs)
  { path: '*', redirectTo: '' }  // Catch-all route (redirect to home for invalid URLs)

  //{ path: '', redirectTo: '/step1', pathMatch: 'full' }, // Default route
];
