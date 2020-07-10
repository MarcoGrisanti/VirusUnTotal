import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[appActiveEllipsis]' })
export class ActiveEllipsisDirective implements AfterViewInit {

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const element = this.elementRef.nativeElement;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.innerHTML;
      }
    }, 200);
  }
}