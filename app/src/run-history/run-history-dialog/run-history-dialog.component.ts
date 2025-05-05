import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import * as _ from 'lodash';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RunhistoriesService } from 'src/app/shared/services/runhistories.service';
import { saveAs } from 'file-saver';
import { sharedConstants } from 'src/app/shared/constants/shared-constants';

@Component({
  selector: 'app-run-history-dialog',
  templateUrl: './run-history-dialog.component.html',
  styleUrls: ['./run-history-dialog.component.scss'],
})
export class RunHistoryDialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private uiConfigService: UiConfigService,
    private alertService: AlertService,
    private runhistService: RunhistoriesService,
  ) {}

  config: any = {};

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getDialogConfig('run-history')) || {};
    this.config.data = this.config.data || [];
  }

  getValue(element) {
    return _.get(this.data, element.name);
  }

  copyValue(value: any, element: any) {
    navigator.clipboard.writeText(value);
    this.alertService.successAlert(element.label + ' Copied');
  }

  downloadFile(value: string, element: any) {
    const body = {
      fileName: value,
      fileType: element.name,
      integrationId: this.data.integrationId,
      runhistoryStatus: this.data.status
    };
      this.runhistService.downloadFile(body).subscribe((res) => {
        if (res) {
          const extension = value.split('.').pop();
          const uint8Array = new Uint8Array(res.data);
          const blob = new Blob([uint8Array], {
            type: `text/${extension};charset=utf-8`,
          });

          saveAs(blob, value);
        }
      },(error) => {
        this.alertService.errorAlert(error.errorMessage || sharedConstants.defaultErrorMessage)
      });
  }

  disCondBased(item) {
    if (item.dispCondField) {
      if (typeof item.dispCondField === 'object') {
        return item.dispCondField.every((element) => {
          const value = _.get(this.data, element);

          return item.dispCondValue[element].includes(value);
        }) && (this.getValue(item));
      } else {
        const value = _.get(this.data, item.dispCondField);

        return value === item.dispCondValue;
      }
    }

    return true;
  }
}
