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
      description:
        '<ul class="text-start"><li>Define Startup/End Dates</li><li>Define Iteration Duration</li><li>Define Team with Specific Roles</li>' +
        '<li>Define Resource Time Allocation</li>' +
        '<li>Project Artifacts</li><li>Auto planned Iterations</li></ul> ',
      icon: '📁',
      link: '/edit-product'
    },
    {
      title: 'Deliverables',
      description:
        '<ul class="text-start"><li>Define deliverable items within a Release</li><li>Define Priority & How Important to Business</li>' +
        '<li>Define Artifacts</li>' +
        '<li>Define Relationship within Deliverables</li><li>Provide Time estimation per Role</li>' +
        '<li>Artifacts</li></ul> ',
      icon: '✅',
      link: '/upload-epic'
    },
    {
      title: 'Team',
      description:
        '<ul class="text-start"><li>Upload/Add Resources</li><li>Manage Leave Plan</li><li>Define Designation</li>' +
        '<li>Define Role</li><li>Resource Availability</li><li>Artifacts</li></ul> ',
      icon: '👥',
      link: '/resource'
    },
    {
      title: 'Calendar',
      description:
        '<ul class="text-start"><li>Maintain Working Minutes</li><li>Define explicit Working Minutes</li><li>Define Weekend</li>' +
        '<li>Declare explicit Working Days</li><li>Decalre Holidays</li><li>Iteration Working Days</li></ul> ',
      icon: '🗓️',
      link: '/company-calendar'
    },
    {
      title: 'Planning',
      description:
        '<ul class="text-start"><li>View unplanned Deliverables</li><li>Define time estimates in Hours</li>' +
        '<li>Update Priorities</li>' +
        '<li>Choose Delivarable to plan</li><li>Auto plan to first Release with matching capacity</li>' +
        '<li>Auto Resource Assignment</li></ul> ',
      icon: '📊',
      link: '/planning'
    },
    {
      title: 'Release',
      description:
        '<ul class="text-start"><li>Auto iteration creation</li><li>Freeze an Iteration</li><li>Dashborad with Iteration in action</li>' +
        '<li>Resource Utilization</li><li>Arhived Releases</li><li>Release Artifacts</li></ul> ',
      icon: '📦',
      link: '/execution'
    }
  ];
  protected readonly messageChange = messageChange;
}
/*
,
{
  title: 'Settings',
    description: 'Change preferences and profile',
  icon: '⚙️',
  link: '/settings'
}*/
