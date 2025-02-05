import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { Priority, PriorityService } from '../services/priority.service';
import {FormBuilder, FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDragPreview,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-priority',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule,
    CdkDropList, CdkDrag, CdkDragPreview], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './priority.component.html',
  styleUrls: ['./priority.component.css'],
  providers:[PriorityService]
})
export class PriorityComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId!:number;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from Section');
  }*/

  models: Priority[] = [];
  totalModels : number = 0;
  selectedModel?: Priority | null = null;
  errorMessage: string = '';
  resetModel: Priority = { id: 0, name: '', companyId: 0, priorityLevel: 0, active: true };
  newModel: Priority = this.resetModel;
  modelService = inject(PriorityService)
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private route: ActivatedRoute,private router: Router) {}

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('companyId'));
    this.loadModels();
  }

/*  drop(event: CdkDragDrop<any[]>) {
    //console.log("drop(event): ", event);
    moveItemInArray(this.models, event.previousIndex, event.currentIndex);
  }*/

  //drop(event: CdkDragDrop<{name: string; poster: string}[]>) {
  //
  drop(event: CdkDragDrop<{name: string}[]>) {
    moveItemInArray(this.models, event.previousIndex, event.currentIndex);
  }

  loadModels(): void {
    this.modelService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.models = data._embedded.priorities;
        this.totalModels = data.page.totalElements;
      },
      error: (err) => {this.errorMessage = err;this.showMessage(err);},
    });
  }

  selectModel(model: Priority): void {
    this.selectedModel = model;
  }

  addModel(): void {
    this.newModel.companyId = this.companyId;
    this.newModel.priorityLevel = this.models.length + 1; // Set priority level based on current models length + 1
    this.newModel.active = true;
    this.modelService.create(this.newModel).subscribe({
      next: (data) => {
        this.models.push(data);
        this.showMessage('Priority is added');
        this.newModel =  this.resetModel;
      },
      error: (err) => {this.errorMessage = err;this.showMessage(err);},
    });
  }

  updateModels(): void {
    var priorityLevel: number = 0;
    var updatedModels: number = 0;
    for (var model of this.models) {
      model.priorityLevel = priorityLevel++;
      this.modelService.update(model.id, model).subscribe({
        next: () => {
          updatedModels++;
          this.selectedModel = null;
          if (updatedModels === this.models.length) {
            this.showMessage('Priority is updated');
            this.loadModels();
          }
        },
        error: (err) => {this.errorMessage = err;this.showMessage('Priority is not updated')}
      });
    }


  }
  updateModel(model: Priority | null): void {
    if (model) {
      this.modelService.update(model.id, model).subscribe({
        next: () => {
          this.showMessage('Priority is updated');
          this.loadModels();
          this.selectedModel = null;
        },
        error: (err) => {this.errorMessage = err;this.showMessage(err);},
      });
    } else {
      console.error('Cannot update.');
    }
  }
  deleteModel(modelId: number): void {
    this.modelService.delete(modelId).subscribe({
      next: () => {
        this.models = this.models.filter((c) => c.id !== modelId);
        this.showMessage('Priority is added');},

      error: (err) => {this.errorMessage = err;this.showMessage(err);},
    });
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // 3 seconds
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
