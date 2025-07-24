import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {BsModalRef, BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {FormatDatePipe} from '../pipes/format.date';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {Role, RoleCode} from '../models/basic';
import {Utils} from '../utils/utils';
import {RoleService} from '../services/role.service';
import {isGlobalHR} from '../utils/helper';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalModule, HttpClientModule, FormatDatePipe, ShowErrorsDirective], // Include FormsModule here
  //template:`Hello`,
  templateUrl: './role.component.html',
  providers: [BsModalService]
})
export class RoleComponent implements OnInit {
//  @Input() companyId:string = '';
  companyId:number = 0;
//  @Output() outputEvent = new EventEmitter<string>();
/*  emitEvent() {
    this.outputEvent.emit('Hello from SubComponent');
  }*/
  modalRef?: BsModalRef;
  @ViewChild('modelC') myModal!: TemplateRef<any>;
  models: Role[] = [];
  errorMessage: string = '';
  model: Role = new Role();
  service = inject(RoleService)
  //constructor(private companyService: CompanyService) {}
  constructor(private modalService: BsModalService,
              private utils: Utils,
              private router: Router,private route: ActivatedRoute) {}
  ngOnInit(): void {
    console.log('Testing')
    this.companyId = this.utils.getCompanyId();
    this.loadModels();
  }

  loadModels(): void {
    this.service.getByCompanyId(this.companyId).subscribe({
      next: (data) => {
        console.log(data);
        this.models = data._embedded.roles;
      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }




  // Create a new company
  add(): void {
    this.model.active = true;
    this.model.companyId = this.companyId;
    this.model.systemRole = false;
    this.model.required = false;
    this.model.code = RoleCode.TR;
    this.service.create(this.model).subscribe({
      next: (data) => {
        this.models.push(data);
        this.model = new Role();
        this.utils.showSuccessMessage('Role is added.');
        this.closeModal();

      },
      error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
    });
  }
  update(): void {
    if (this.model) {
      this.service.update(this.model.id, {name: this.model.name}).subscribe({
        next: () => {
          this.loadModels();
          this.model = new Role();
          this.utils.showSuccessMessage('Role is updated.');
          this.closeModal();
        },
        error: (err) => {this.errorMessage = err;this.utils.showErrorMessage(err);},
      });
    } else {
      console.error('Cannot update. Component is null.');
    }
  }
  delete(id: number): void {
    if (window.confirm("Are you sure you want to delete?")) {
      this.service.delete(id).subscribe({
        next: () => (this.models = this.models.filter((c) => c.id !== id)),
        error: (err) => {
          this.errorMessage = err;
          this.utils.showErrorMessage(err);
        },
      });
    }
  }

  openModal(template: TemplateRef<any>) {
    this.model = new Role();
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(template: TemplateRef<any>, id: number) {
    if (id) {
      this.model = this.models.find((x) => x.id === id)
        ?? new Role();
      this.modalRef = this.modalService.show(template);
    }
  }
  closeModal() {
    this.modalRef?.hide();
  }


  protected readonly isGlobalHR = isGlobalHR;
}
