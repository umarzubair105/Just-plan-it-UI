import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-annual-leave',
  templateUrl: './annual-leave.component.html',
  styleUrls: ['./annual-leave.component.css'],
  standalone: true
})
export class AnnualLeaveComponent {
  leaveForm: FormGroup;
  leaves: any[] = [];

  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.leaveForm = this.fb.group({
      employeeName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  openModal() {
    const modalElement = document.getElementById('addLeaveModal');
    if (modalElement) {
      new bootstrap.Modal(modalElement).show();
    }
  }

  addLeave() {
    if (this.leaveForm.valid) {
      this.leaves.push(this.leaveForm.value);
      this.leaveForm.reset();
      const modalElement = document.getElementById('addLeaveModal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance?.hide();
      }
    }
  }

  deleteLeave(index: number) {
    this.leaves.splice(index, 1);
  }
}
