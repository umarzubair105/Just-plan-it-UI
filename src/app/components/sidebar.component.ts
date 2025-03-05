import { Component } from '@angular/core';
import {RouterLink, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, RouterModule
  ],
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  menuItems = [
    { label: 'Home', link: '/home',icon: 'dashboard'  },
/*    { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
    { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
    { label: 'Epics', link: '/epics', icon: 'assignment' },
    { label: 'Reports', link: '/reports', icon: 'bar_chart' }*/
  ];
}
