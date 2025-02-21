import { Component, TemplateRef } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common'; // ✅ Use CommonModule
import { FormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
}

@Component({
  selector: 'app-annual-leaves',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, ModalModule], // ✅ NO BrowserAnimationsModule here!
  templateUrl: './annual-leave.component.html',
  providers: [BsModalService]
})
export class AnnualLeaveComponent {
  modalRef?: BsModalRef;
  leaves: Leave[] = [];
  leave?: Leave;
  newLeave: Leave = { id: 0, startDate: '', endDate: '', reason: '' };

  constructor(private modalService: BsModalService) {}

  // Open modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  openModalEdit(viewLeaveTemplate: TemplateRef<any>, leaveId: number) {
    if (leaveId) {
      this.leave = this.leaves.find((x) => x.id === leaveId);
      console.log(this.leave);
      this.modalRef = this.modalService.show(viewLeaveTemplate);
    }
  }
  // Close modal
  closeModal() {
    this.modalRef?.hide();
  }

  // Add new leave
  addLeave() {
    if (this.newLeave.startDate && this.newLeave.endDate && this.newLeave.reason) {
      this.newLeave.id = this.leaves.length + 1;
      this.leaves.push({ ...this.newLeave });
      this.newLeave = { id: 0, startDate: '', endDate: '', reason: '' }; // Reset form
      this.closeModal();
    }
  }

  // Delete leave
  deleteLeave(id: number) {
    this.leaves = this.leaves.filter(leave => leave.id !== id);
  }
}
