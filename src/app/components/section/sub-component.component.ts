import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { SubComponentService, } from '../../services/sub-component.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {SubComponent} from '../../models/basic';
@Component({
  selector: 'app-subComponent',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './sub-component.component.html',
  styleUrls: ['./sub-component.component.css'],
})
export class SubComponentComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId:number = 2;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from SubComponent');
  }*/

  subComponents: SubComponent[] = [];
  totalSubComponents : number = 0;
  selectedSubComponent: SubComponent | null = null;
  errorMessage: string = '';
  newSubComponent: SubComponent = new SubComponent();
  subComponentService = inject(SubComponentService)
  //constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    console.log('Testing')
    this.loadSubComponents();
  }
  loadSubComponents(): void {
    this.subComponentService.getAll().subscribe({
      next: (data) => {
        console.log(data);
        this.subComponents = data._embedded.components;
        this.totalSubComponents = data.page.totalElements;
      },
      error: (err) => (this.errorMessage = err),
    });
  }

  selectSubComponent(subComponent: SubComponent): void {
    this.selectedSubComponent = subComponent;
  }

  // Create a new company
  addSubComponent(): void {
    this.subComponentService.create(this.newSubComponent).subscribe({
      next: (data) => {
        this.subComponents.push(data);
        this.newSubComponent = new SubComponent();
      },
      error: (err) => (this.errorMessage = err),
    });
  }
  updateSubComponent(subComponent: SubComponent | null): void {
    if (subComponent) {
      this.subComponentService.update(subComponent.id, subComponent).subscribe({
        next: () => {
          this.loadSubComponents();
          this.selectedSubComponent = null;
        },
        error: (err) => (this.errorMessage = err),
      });
    } else {
      console.error('Cannot update. SubComponent is null.');
    }
  }
  deleteSubComponent(subComponentId: number): void {
    this.subComponentService.delete(subComponentId).subscribe({
      next: () => (this.subComponents = this.subComponents.filter((c) => c.id !== subComponentId)),
      error: (err) => (this.errorMessage = err),
    });
  }
}
