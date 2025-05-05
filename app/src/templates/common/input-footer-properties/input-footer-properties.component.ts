import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

export interface Date {
  id: string;
  name: string;
}
@Component({
  selector: 'app-input-footer-properties',
  templateUrl: './input-footer-properties.component.html',
  styleUrls: ['./input-footer-properties.component.scss'],
})
export class InputFooterPropertiesComponent {
  /** list of dates */

  @ViewChild('singleSelect', { static: true }) singleSelect:
    | MatSelect
    | undefined;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  @Input() properties;
  @Input() activeFieldDetails;
  @Input() data;
  @Input() enumData;
  @Input() handlers;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  config: any;

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getFormViewConfig('templates')) || {};
  }

  ngOnChanges() {
    this.data = this.data || {};
    this.enumData = this.enumData || {};
    this.enumData.DataType = this.enumData.DataType || [];
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }
}
