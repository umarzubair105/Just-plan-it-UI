import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';
import {messageChange} from '../utils/helper';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.html',
  imports: [
    RouterLink,
    NgForOf
  ]
})
export class HomeComponent {
  features = [
    {
      title: 'Projects',
      description: 'Create and manage your projects',
      icon: '📁',
      link: '/product'
    },
    {
      title: 'Tasks',
      description: 'Assign and track tasks',
      icon: '✅',
      link: '/tasks'
    },
    {
      title: 'Team',
      description: 'Upload Team Resources through Excel. Manage Resource Availability across Projects. Manage resource leave plan. Manage resource role for different projects.Upload Team Resources through Excel. Manage Resource Availability across Projects. Manage resource leave plan. Manage resource role for different projects',
      icon: '👥',
      link: '/team'
    },
    {
      title: 'Calendar',
      description: 'View deadlines and milestones',
      icon: '🗓️',
      link: '/calendar'
    },
    {
      title: 'Reports',
      description: 'Track progress with reports',
      icon: '📊',
      link: '/reports'
    },
    {
      title: 'Settings',
      description: 'Change preferences and profile',
      icon: '⚙️',
      link: '/settings'
    }
  ];
  protected readonly messageChange = messageChange;
}
