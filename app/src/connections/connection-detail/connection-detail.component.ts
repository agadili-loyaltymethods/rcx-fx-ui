import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'connection-detail',
  templateUrl: './connection-detail.component.html',
  styleUrls: ['./connection-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConnectionDetailsComponent {
  options: any = ['Select', 'Option1', 'Option2', 'Option3'];
}
