import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
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
  transferArrayItem,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import {RoleService} from '../services/role.service';
import {DesignationService} from '../services/designation.service';
import {CompanyService, MapDesignation} from '../services/company.service';
import {Utils} from '../utils/utils';
import {Designation, Role} from '../models/basic';
@Component({
  selector: 'app-mapping-roles-designation',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule,
    CdkDropList, CdkDrag, CdkDragPreview], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.css']
})
export class MappingComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId!:number;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from Section');
  }*/

  sourceModels: Designation[] = [];
  targetModels: Role[] = [];
  errorMessage: string = '';
  sourceService = inject(DesignationService)
  targetService = inject(RoleService)
  companyService = inject(CompanyService)
  constructor(private fb: FormBuilder, private utils: Utils,
              private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.companyId = this.utils.getCompanyId();
    //Number(this.route.snapshot.paramMap.get('companyId'));
    this.loadModels();
  }

/*  drop(event: CdkDragDrop<any[]>) {
    //console.log("drop(event): ", event);
    moveItemInArray(this.models, event.previousIndex, event.currentIndex);
  }*/

  //drop(event: CdkDragDrop<{name: string; poster: string}[]>) {
  //


  loadModels(): void {
    this.sourceService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.sourceModels = data._embedded.designations;
      },
      error: (err) => {this.errorMessage = err;this.utils.showSuccessMessage(err);},
    });
    this.targetService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.targetModels = data._embedded.roles;
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }


  updateModels(): void {
    for (var source of this.sourceModels) {
      if (source.roleId) {
        var mapM: MapDesignation = {designationId: source.id, roleId: source.roleId};
        this.companyService.mapDesignation(mapM).subscribe({
          next: () => {
            this.utils.showSuccessMessage('Updated successfully');
            if (sessionStorage.getItem('wizard')) {
              this.router.navigate(['/company-calendar']);
            }
          },
          error: (err) => {
            this.errorMessage = err;
            this.utils.showErrorMessage('Mapping is not updated')
          }
        });
      }
    }
  }



}
