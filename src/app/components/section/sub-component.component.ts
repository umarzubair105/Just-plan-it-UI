import {Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import { SubComponentService, } from '../../services/sub-component.service';
import {FormBuilder, FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {ResourceLeave, SubComponent} from '../../models/basic';
import {Utils} from '../../utils/utils';
import {ActivatedRoute, Router} from '@angular/router';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {FormatDatePipe} from '../../pipes/format.date';
import {ShowErrorsDirective} from '../../directives/show-errors.directive';
import {isGlobalHR} from "../../utils/helper";

@Component({
  selector: 'app-subComponent',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalModule, HttpClientModule, FormatDatePipe, ShowErrorsDirective], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './sub-component.component.html',
  styleUrls: ['./sub-component.component.css'],
  providers: [BsModalService]
})
export class SubComponentComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId:number = 0;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from SubComponent');
  }*/
  modalRef?: BsModalRef;
  @ViewChild('modelC') myModal!: TemplateRef<any>;
  subComponents: SubComponent[] = [];
  errorMessage: string = '';
  subComponent: SubComponent = new SubComponent();
  subComponentService = inject(SubComponentService)
  //constructor(private companyService: CompanyService) {}
  constructor(private modalService: BsModalService,
              private utils: Utils,
              private router: Router,private route: ActivatedRoute) {}
  ngOnInit(): void {
    console.log('Testing')
    this.companyId = this.utils.getCompanyId();
    this.loadSubComponents();
    if (sessionStorage.getItem('wizard'))
    {
      setTimeout(() => {
        this.openModal(this.myModal);
      }, 0);
    }
  }
  loadSubComponents(): void {
    this.subComponentService.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.subComponents = data._embedded.components;
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }



  // Create a new company
  add(): void {
    this.subComponent.active = true;
    this.subComponent.companyId = this.companyId;

    this.subComponentService.create(this.subComponent).subscribe({
      next: (data) => {
        this.subComponents.push(data);
        this.subComponent = new SubComponent();
        this.utils.showSuccessMessage('Component is added.');
        this.closeModal();

      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }
  update(): void {
    if (this.subComponent) {
      this.subComponentService.update(this.subComponent.id, this.subComponent).subscribe({
        next: () => {
          this.loadSubComponents();
          this.subComponent = new SubComponent();
          this.utils.showSuccessMessage('Component is updated.');
          this.closeModal();
        },
        error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
      });
    } else {
      console.error('Cannot update. Component is null.');
    }
  }
  delete(subComponentId: number): void {
    if (window.confirm("Are you sure you want to delete?")) {
      this.subComponentService.delete(subComponentId).subscribe({
        next: () => (this.subComponents = this.subComponents.filter((c) => c.id !== subComponentId)),
        error: (err) => {
          this.errorMessage = err;
          this.utils.showErrorMessage(err);
        },
      });
    }
  }

  openModal(template: TemplateRef<any>) {
    this.subComponent = new SubComponent();
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.subComponent = this.subComponents.find((x) => x.id === id)
        ?? new SubComponent();
      this.modalRef = this.modalService.show(template);
    }
  }
  closeModal() {
    this.modalRef?.hide();
  }

  onSkip():void {
    if (sessionStorage.getItem('wizard')) {
      this.router.navigate(['/product-resource']);
    }
  }
  isWizard():boolean {
    return sessionStorage.getItem('wizard')!=null && sessionStorage.getItem('wizard')=='productSetup';
  }

    protected readonly isGlobalHR = isGlobalHR;
}
