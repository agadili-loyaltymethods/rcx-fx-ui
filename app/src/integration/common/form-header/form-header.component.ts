import { Component, Input } from '@angular/core';

interface headerDataInterface {
  headerName: string;
  status?: string;
  lastUpdateBy?: string;
  date?: string;
  time?: string;
}
@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
})
export class FormHeaderComponent {
  @Input() headerData: headerDataInterface;
  @Input() properties;
}
