import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { SectionService, Section } from '../../services/section.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-section',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css'],
})
export class SectionComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId:number = 2;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from Section');
  }*/

  sections: Section[] = [];
  totalSections : number = 0;
  selectedSection: Section | null = null;
  errorMessage: string = '';
  newSection: Section = { id: 0, name: '', companyId: this.companyId }
  sectionService = inject(SectionService)
  //constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    console.log('Testing')
    this.loadSections();
  }
  loadSections(): void {
    this.sectionService.getAll().subscribe({
      next: (data) => {
        console.log(data);
        this.sections = data._embedded.components;
        this.totalSections = data.page.totalElements;
      },
      error: (err) => (this.errorMessage = err),
    });
  }

  selectSection(section: Section): void {
    this.selectedSection = section;
  }

  // Create a new company
  addSection(): void {
    this.sectionService.create(this.newSection).subscribe({
      next: (data) => {
        this.sections.push(data);
        this.newSection = { id: 0, name: '', companyId: this.companyId };
      },
      error: (err) => (this.errorMessage = err),
    });
  }
  updateSection(section: Section | null): void {
    if (section) {
      this.sectionService.update(section.id, section).subscribe({
        next: () => {
          this.loadSections();
          this.selectedSection = null;
        },
        error: (err) => (this.errorMessage = err),
      });
    } else {
      console.error('Cannot update. Section is null.');
    }
  }
  deleteSection(sectionId: number): void {
    this.sectionService.delete(sectionId).subscribe({
      next: () => (this.sections = this.sections.filter((c) => c.id !== sectionId)),
      error: (err) => (this.errorMessage = err),
    });
  }
}
