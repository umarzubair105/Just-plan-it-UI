import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  DoCheck,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[showErrors]',
  standalone: true,
})
export class ShowErrorsDirective implements OnInit, DoCheck {
  @Input('showErrors') errorMessages!: { [key: string]: string };

  private errorElement: HTMLElement | null = null;

  constructor(private control: NgControl, private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.createErrorElement();
  }

  ngDoCheck(): void {
    if (this.control.invalid && this.control.touched) {
      const firstErrorKey = Object.keys(this.control.errors || {})[0];
      const errorMessage = this.errorMessages[firstErrorKey];
      this.setErrorMessage(errorMessage);
    } else {
      this.setErrorMessage(null);
    }
  }

  private createErrorElement(): void {
    this.errorElement = this.renderer.createElement('div');
    this.renderer.addClass(this.errorElement, 'invalid-feedback');//text-danger
    this.renderer.addClass(this.errorElement, 'mt-1');
    this.renderer.appendChild(this.el.nativeElement.parentElement, this.errorElement);
  }

  private setErrorMessage(message: string | null): void {
    if (this.errorElement) {
      this.renderer.setProperty(this.errorElement, 'textContent', message || '');
    }
  }
}
