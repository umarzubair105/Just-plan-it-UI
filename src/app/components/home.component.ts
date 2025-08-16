import {Component, inject, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NgClass, NgForOf} from '@angular/common';
import {messageChange} from '../utils/helper';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {FormBuilder, Validators} from '@angular/forms';
import {Utils} from '../utils/utils';
import {MatDialog} from '@angular/material/dialog';
import {Resource} from '../models/basic';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.html',
  imports: [
    RouterLink,
    NgForOf,
    NgClass,ModalModule
  ],
  providers: [BsModalService]
})
export class HomeComponent {
  modalRef?: BsModalRef;

  images= [ 'assets/images/project.png','assets/images/calendar.png'];
  features = [
    {
      title: 'Projects',
      description:
        '<ul class="text-start"><li>Define Startup/End Dates</li><li>Define Iteration Duration</li><li>Define Team with Specific Roles</li>' +
        '<li>Define Resource Time Allocation</li>' +
        '<li>Project Artifacts</li><li>Auto planned Iterations</li></ul> ',
      icon: '📁',
      link: '/edit-product',
      images: [ 'assets/images/project.png','assets/images/project.png']
    },
    {
      title: 'Deliverables',
      description:
        '<ul class="text-start"><li>Define deliverable items within a Release</li><li>Define Priority & How Important to Business</li>' +
        '<li>Define Artifacts</li>' +
        '<li>Define Relationship within Deliverables</li><li>Provide Time estimation per Role</li>' +
        '<li>Artifacts</li></ul> ',
      icon: '✅',
      link: '/upload-epic',
      images: [ 'assets/images/project.png','assets/images/project.png']
    },
    {
      title: 'Team',
      description:
        '<ul class="text-start"><li>Upload/Add Resources</li><li>Manage Leave Plan</li><li>Define Designation</li>' +
        '<li>Define Role</li><li>Resource Availability</li><li>Artifacts</li></ul> ',
      icon: '👥',
      link: '/resource',
      images: [ 'assets/images/project.png','assets/images/project.png']
    },
    {
      title: 'Calendar',
      description:
        '<ul class="text-start"><li>Maintain Working Minutes</li><li>Define explicit Working Minutes</li><li>Define Weekend</li>' +
        '<li>Declare explicit Working Days</li><li>Decalre Holidays</li><li>Iteration Working Days</li></ul> ',
      icon: '🗓️',
      link: '/company-calendar',
      images: [ 'assets/images/project.png','assets/images/project.png']
    },
    {
      title: 'Planning',
      description:
        '<ul class="text-start"><li>View unplanned Deliverables</li><li>Define time estimates in Hours</li>' +
        '<li>Update Priorities</li>' +
        '<li>Choose Delivarable to plan</li><li>Auto plan to first Release with matching capacity</li>' +
        '<li>Auto Resource Assignment</li></ul> ',
      icon: '📊',
      link: '/planning',
      images: [ 'assets/images/project.png','assets/images/project.png']
    },
    {
      title: 'Release',
      description:
        '<ul class="text-start"><li>Auto iteration creation</li><li>Freeze an Iteration</li><li>Dashborad with Iteration in action</li>' +
        '<li>Resource Utilization</li><li>Arhived Releases</li><li>Release Artifacts</li></ul> ',
      icon: '📦',
      link: '/execution',
      images: [ 'assets/images/project.png','assets/images/project.png']

    }
  ];

  galleryImages: string[] = [];
  currentIndex = 0;
  currentImage: string | null = null;

  constructor(private modalService: BsModalService) {
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  closeModal() {
    this.modalRef?.hide();
  }
  openGallery(template: TemplateRef<any>) {
    this.galleryImages = this.images;
    this.currentIndex = 0;
    this.currentImage = this.galleryImages[this.currentIndex];

    // open Bootstrap modal
    this.modalRef = this.modalService.show(template);
    //const modal = new bootstrap.Modal(document.getElementById('galleryModal')!);
    //modal.show();
  }

  nextImage() {
    if (!this.galleryImages.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.galleryImages.length;
    this.currentImage = this.galleryImages[this.currentIndex];
  }

  prevImage() {
    if (!this.galleryImages.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    this.currentImage = this.galleryImages[this.currentIndex];
  }
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
