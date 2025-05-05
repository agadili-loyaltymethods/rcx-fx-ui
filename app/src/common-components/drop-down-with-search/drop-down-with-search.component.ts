import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

export interface Options {
  id: string;
  name: string;
}

@Component({
  selector: 'app-drop-down-with-search',
  templateUrl: './drop-down-with-search.component.html',
  styleUrls: ['./drop-down-with-search.component.scss'],
})
export class DropDownWithSearchComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input() placeHolder = 'Select Value';
  @Input() label = '';
  @Input() placeHolderSearchBox = 'Select Value';
  @Input() selectedValue: any[] = [];
  @Input() selectBoxOptions: Options[];
  @Input() callBack: Function;
  @Input() multiple = false;
  @Output() valueChange = new EventEmitter();
  @Input() fieldName: string;
  // inputValue: any[] = this.selectedValue;
  dropDownEllipsis: any = {};
  ellipsisData = '';

  /** control for the selected bank for multi-selection */
  public selectCtrl: FormControl<any> = new FormControl<any>(null);
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  /** control for the MatSelect filter keyword */
  public selectFilterCtrl: FormControl<string | null> = new FormControl<string>(
    '',
  );

  /** list of Options filtered by search keyword */
  public filteredOptions: ReplaySubject<Options[]> = new ReplaySubject<
    Options[]
  >(1);

  /** local copy of filtered banks to help set the toggle all checkbox state */
  protected filteredOptionsCache: Options[] = [];

  /** flags to set the toggle all checkbox state */
  isIndeterminate = false;
  isChecked = false;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    // set initial selection
    this.selectCtrl.setValue([]);
    const ellipsisProperty =
      await this.uiConfigService.importCommonProperties('dropDownEllipsis');

    if (ellipsisProperty) {
      this.dropDownEllipsis = ellipsisProperty;
    }
    // this.filteredOptions.next(this.selectBoxOptions.slice());

    // listen for search field value changes
    this.selectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterOptionsMulti();
        this.setToggleAllCheckboxState();
      });

    // listen for multi select field value changes
    this.selectCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.setToggleAllCheckboxState();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnChanges() {
    this.selectBoxOptions =
      this.selectBoxOptions?.filter((obj) => {
        return obj && obj.name;
      }) || [];
    this.filteredOptions.next(
      this.selectBoxOptions
        .sort((a, b) => a?.name?.localeCompare(b?.name))
        .slice(),
    );
    this.selectCtrl.setValue(this.selectedValue || []);
    this.filterOptionsMulti();
  }

  protected setInitialValue() {
    this.filteredOptions
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.multiSelect)
          this.multiSelect.compareWith = (a: Options, b: Options) =>
            a && b && a.id === b.id;
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected filterOptionsMulti() {
    if (!this.selectBoxOptions) {
      return;
    }
    // get the search keyword
    let search = this.selectFilterCtrl.value;

    if (!search) {
      this.filteredOptionsCache = this.selectBoxOptions.slice();
      this.filteredOptions.next(this.filteredOptionsCache);

      // this.selectCtrl.setValue([]);
      // this.onInputValueChange();
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredOptionsCache = this.selectBoxOptions.filter(
      (option) => option.name.toLowerCase().indexOf(search) > -1,
    );
    this.filteredOptions.next(this.filteredOptionsCache);
  }

  toggleSelectAll(selectAllValue: boolean) {
    this.filteredOptions
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          this.selectCtrl.patchValue(val);
        } else {
          this.selectCtrl.patchValue([]);
        }
      });
    this.onInputValueChange();
  }

  protected setToggleAllCheckboxState() {
    let filteredLength = 0;

    this.ellipsisData = this.selectCtrl?.value
      ?.map((item) => item.name)
      .join(', ');
    if (this.selectCtrl && this.selectCtrl.value) {
      const optionsSelected = this.filteredOptionsCache?.length
        ? this.filteredOptionsCache
        : this.selectBoxOptions;

      optionsSelected &&
        optionsSelected.forEach((el) => {
          this.selectCtrl.value.forEach((element) => {
            if (el.name === element.name) {
              filteredLength++;
            }
          });
        });
      this.isChecked =
        filteredLength > 0 && filteredLength === optionsSelected.length;
    }
  }

  calculateEllipsisMaxLength(): number | null {
    if (
      this.selectCtrl?.value?.length > 1 &&
      this.selectCtrl?.value?.length != this.selectBoxOptions?.length
    ) {
      return this.dropDownEllipsis?.multiSelectedMaxLength;
    }
    if (this.selectCtrl?.value?.length === 1) {
      return this.dropDownEllipsis?.singleSelectedMaxLength;
    }

    return null;
  }

  getEllipsisData(): string {
    if (this.selectCtrl?.value?.length === this.selectBoxOptions?.length) {
      return 'All Selected';
    } else {
      return this.ellipsisData;
    }
  }

  onInputValueChange() {
    const options = {
      input: this.selectCtrl.value || '',
      fieldName: this.fieldName,
    };
    this.valueChange.emit(options)
  }
}
