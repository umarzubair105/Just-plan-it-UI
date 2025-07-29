import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';

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
  ss:string = 'sss';
  features = [
    {
      title: 'Projects',
      description: 'Create and manage your projects',
      icon: '📁',
      link: '/projects'
    },
    {
      title: 'Tasks',
      description: 'Assign and track tasks',
      icon: '✅',
      link: '/tasks'
    },
    {
      title: 'Team',
      description: 'Manage your team members',
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
}
