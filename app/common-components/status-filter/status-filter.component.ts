import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss'],
})
export class StatusFilterComponent {
  @Input() statusFilter = 'all';
  @Output() filterChange = new EventEmitter();
  onFilterChange() {
    this.filterChange.emit(this.statusFilter);
  }

  ngOnChanges() {
    this.statusFilter = this.statusFilter || 'all';
  }
}
