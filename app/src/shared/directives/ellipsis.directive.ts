import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { UiConfigService } from '../services/ui-config.service';

@Directive({
  selector: '[IsEllipsisActive]',
})
export class EllipsisDirective {
  @Input() ellipsisMaxLength: any;
  @Input() showEllipsis: any;
  @Input() ellipsisData: any;
  @Input() ellipsisIgnoreFields: any = [];
  @Input() hoverData: string;

  cfgEllipsisMaxLength: any;
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private matTooltip: MatTooltip,
    private uiConfigService: UiConfigService,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    const commonProperties =
      await this.uiConfigService.importCommonProperties();
    const element = this.elementRef.nativeElement;
    const ellipsisMaxLength =
      this.ellipsisMaxLength || commonProperties?.ellipsisMaxLength;

    if (
      this.showEllipsis !== 'false' &&
      element.innerText &&
      element.innerText.length > ellipsisMaxLength &&
      !this.matTooltip.message
    ) {
      this.matTooltip.message = element.innerText;
      this.renderer.setProperty(
        element,
        'innerText',
        element.innerText.substring(0, ellipsisMaxLength) + '...',
      );
    }
  }

  async ngOnChanges(): Promise<void> {
    const commonProperties =
      await this.uiConfigService.importCommonProperties();
    const element = this.elementRef.nativeElement;
    const ellipsisMaxLength =
      this.ellipsisMaxLength || commonProperties?.ellipsisMaxLength;

    if (this.hoverData && !['false', 'undefined'].includes(this.hoverData)) {
      this.matTooltip.message = this.hoverData;
    } else if (
      this.ellipsisData &&
      !this.ellipsisIgnoreFields.includes(this.ellipsisData)
    ) {
      if (this.ellipsisData.length > ellipsisMaxLength) {
        this.matTooltip.message = this.ellipsisData;
        this.renderer.setProperty(
          element,
          'innerText',
          this.ellipsisData.substring(0, ellipsisMaxLength) + '...',
        );
      } else {
        this.renderer.setProperty(element, 'innerText', this.ellipsisData);
        this.matTooltip.message = null;
      }
    } else if (
      this.ellipsisData === '' ||
      this.ellipsisIgnoreFields.includes(this.ellipsisData)
    ) {
      this.renderer.setProperty(element, 'innerText', this.ellipsisData);
    }
  }
}
