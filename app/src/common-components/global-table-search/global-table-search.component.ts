import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-global-table-search',
  templateUrl: './global-table-search.component.html',
  styleUrls: ['./global-table-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GlobalTableSearchComponent {
  @Input() searchPlaceHolder = 'Search By Name';
  @Input() widthClass = 'Search By Name';
  @Output() inputValueChange = new EventEmitter();
  @Output() searchValueChange = new EventEmitter();
  inputValue = '';
  searchValue = '';

  onInputValueChange(event: any) {
    this.inputValue = event.target.value;
    this.inputValueChange.emit(this.inputValue);
  }

  onBlur(event: any) {
    this.searchValue = event.target.value;
    this.searchValueChange.emit(this.searchValue);
  }
}
