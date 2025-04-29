import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-side-panel',
  templateUrl: './error-side-panel.component.html',
  styleUrls: ['./error-side-panel.component.scss'],
})
export class ErrorSidePanelComponent {
  showFiller = true;
  @Input() drawer: any;
  @Input() errors: any = [];
}
