import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocusDirective implements AfterViewInit {
  @Input('appAutoFocus') hasAutoFocus: any;

  constructor(private el: ElementRef) {
    if (this.hasAutoFocus) {
      this.el.nativeElement.focus();
      this.el.nativeElement.autofocus = true;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.hasAutoFocus) {
        this.el.nativeElement.focus();
      }
    }, 400);
  }
}
