import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPositiveInteger]',
  standalone: true,
  // Note the selector format
})
export class PositiveIntegerDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    this.el.nativeElement.value = sanitizedValue;
  }
}
