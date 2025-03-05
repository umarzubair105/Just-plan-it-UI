import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { PriorityService } from '../services/priority.service';
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
import {Utils} from '../utils/utils';
import {Priority} from '../models/basic';
@Component({
  selector: 'app-priority',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule,
    CdkDropList, CdkDrag, CdkDragPreview], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './priority.component.html',
  styleUrls: ['./priority.component.css'],
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
  resetModel: Priority = new Priority();
  newModel: Priority = this.resetModel;
  modelService = inject(PriorityService)
  productId! : number;
  constructor(private fb: FormBuilder, private utils: Utils,
              private router: Router,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.companyId = this.utils.getCompanyId();
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));
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
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
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
        this.utils.showSuccessMessage('Priority is added');
        this.newModel =  this.resetModel;
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
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
            this.utils.showSuccessMessage('Priority is updated');
            this.loadModels();
          }
        },
        error: (err) => {this.errorMessage = err;this.utils.showErrorMessage('Priority is not updated')}
      });
    }
    this.router.navigate(['/planning', this.productId]);
  }
  updateModel(model: Priority | null): void {
    if (model) {
      this.modelService.update(model.id, model).subscribe({
        next: () => {
          this.utils.showSuccessMessage('Priority is updated');
          this.loadModels();
          this.selectedModel = null;
        },
        error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
      });
    } else {
      console.error('Cannot update.');
    }
  }
  deleteModel(modelId: number): void {
    this.modelService.delete(modelId).subscribe({
      next: () => {
        this.models = this.models.filter((c) => c.id !== modelId);
        this.utils.showSuccessMessage('Priority is added');},

      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }

}
