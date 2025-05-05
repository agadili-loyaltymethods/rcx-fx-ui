import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { AlertService } from '../../shared/services/alert.service';
import { UtilsService } from '../../shared/services/utils.service';
import { AuthService } from 'src/app/shared/services/auth.service';
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent {
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Output() isModifiedChanged: EventEmitter<boolean> = new EventEmitter();

  @Input() title;
  @Input() config: any = {};
  @Input() data: any = {};
  @Input() requiredData = [];
  @Input() properties?;
  @Input() handlers?;

  @Input() activeFieldDetails?;
  dataFields: any = [];
  selectData: [];
  configData: any;
  isView = false;
  isEdit = false;
  routeSub: Subscription;
  selectedOption: any = null;
  formGroup: FormGroup;
  subscription?: Subscription;
  isModified = false;
  sinfo = {};
  buttonTitle: any;
  iconType: any;
  previousValues: {[key: string]: any} = {};


  constructor(
    private uiConfigService: UiConfigService,
    private route: ActivatedRoute,
    private pipeService: DynamicPipeService,
    private utilsService: UtilsService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange && this.formGroup) {
      this.previousValues = {...this.data};
      this.buildForm();
      this.updateButtonProperties();
    }
  }

  async ngOnInit() {
    this.configData =
      this.config && this.config.data && this.config.data[this.title];
    this.dataFields = this.configData.dataFields || [];
    this.sinfo = await this.authService.getServerInfo();
    this.routeSub = this.route.url.subscribe((url) => {
      this.isView = url[0]?.path === 'detail';
      this.isEdit = url[0]?.path === 'edit';
    });
    this.config.commonProperties =
      await this.uiConfigService.importCommonProperties();
    const asyncFuncHandlers = this.config?.componentInitialization?.asyncFuncs;

    asyncFuncHandlers?.forEach(async (func) => {
      if (this.handlers && typeof this.handlers[func] === 'function') {
        await this.handlers[func]();
        this.buildForm();
      }
    });
    if (this.data) {
      this.previousValues = {...this.data};
    }
    this.updateButtonProperties();
    this.buildForm();
    this.formGroup.valueChanges.subscribe(() => {
      this.isModified = true;
      this.isModifiedChanged.emit(this.isModified);
    });
  }

  // Build formGroup dynamically
  buildForm() {
    this.subscription?.unsubscribe();
    this.formGroup = new FormGroup(this.getInitialFormControls());
    if (this.data) {
      this.formGroup.patchValue(this.data);
    }
    this.formStatus.emit(this.formGroup);
    this.subscription = this.formGroup.valueChanges
      .pipe(
        distinctUntilChanged((previous, current) => {
          return JSON.stringify(previous) === JSON.stringify(current);
        }),
      )
      .subscribe(() => {
        Object.keys(this.formGroup.value).forEach(key => {
          if (this.data[key] !== this.formGroup.value[key]) {
            this.previousValues[key] = this.data[key];
          }
        });
        this.handleFormValueChanges()});
  }

  // Add form fields with initial data and validators
  getInitialFormControls() {
    const formGroupFields = {};

    this.dataFields
      .flatMap((dataField) => dataField.fields)
      .forEach((field) => {
        if (this.displayConditionBased(field)) {
          formGroupFields[field.field] = this.addControl(field);

          //For partnerFormControl
          if (field.formControl) {
            formGroupFields[field.formControl] = new FormControl('');
          }
        }
      });

    return formGroupFields;
  }

  handleFormValueChanges() {
    Object.keys(
      this.utilsService.removeEmptyFields({ ...this.formGroup.value }),
    ).forEach((key) => {
      this.data[key] = this.formGroup.value[key];
    });
    this.updateConditionalFields();
    if (this.formGroup.valid) {
      this.alertService.closeAlert();
    }
    this.formStatus.emit(this.formGroup);
  }

  updateConditionalFields() {
    this.dataFields.forEach((dataField) => {
      dataField.fields.forEach((field) => {
        const fieldsWithSameName = dataField.fields.filter(
          (dField) => dField.field == field.field,
        );
        const fieldToDisable = fieldsWithSameName.find((field) =>
          this.disableConditionBased(field),
        );

        if (fieldToDisable) {
          this.formGroup.controls[fieldToDisable.field]?.disable({
            emitEvent: false,
          });
        } else {
          this.formGroup.controls[field.field]?.enable({ emitEvent: false });
        }

        const visibleField = fieldsWithSameName.find((field) =>
          this.displayConditionBased(field),
        );

        if (visibleField) {
          this.formGroup.addControl(
            field.field,
            this.addControl(visibleField),
            { emitEvent: false },
          );
          this.formGroup.controls[field.field].setValidators(
            this.addValidator(visibleField),
          );
          this.formGroup.controls[field.field].updateValueAndValidity();
        } else {
          this.formGroup.removeControl(field.field, { emitEvent: false });
        }
      });
    });
  }

  addControl(field) {
    const validators = this.addValidator(field);
    const initValue =
      this.data[field.field] !== undefined
        ? this.data[field.field]
        : field.type === 'switch'
          ? false
          : undefined;

    return new FormControl(
      {
        value: initValue,
        disabled: this.isView || this.disableConditionBased(field),
      },
      validators,
    );
  }

  // Add validators for each field as required
  addValidator(fieldObj) {
    const validators = Object.keys(fieldObj).map((field) => {
      if (this.isEdit) {
        if (fieldObj.isSecret) {
          return null;
        }
      }
      switch (field) {
        case 'required':
          return fieldObj[field] ? Validators.required : null;
        case 'email':
          return Validators.pattern(
            '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
          ); //Email Regex
        case 'regExp':
          return Validators.pattern(fieldObj[field]);
        case 'minLength':
          return Validators.minLength(fieldObj[field]);
        case 'maxLength':
          return Validators.maxLength(fieldObj[field]);
        case 'configCheck':
          if(fieldObj.configCheck && this.sinfo[fieldObj['max']] > 0) {
            return Validators.max(this.sinfo[fieldObj['max']]);
          }
      }
    });

    return validators.filter(Boolean);
  }

  disableConditionBased(item) {
    if (item.disabled) {
      return true;
    }
    if (item.disabledOnEdit && this.isEdit) {
      return true;
    }
    if (item.disableCondField) {
      const value = _.get(this[item.disableCondPar], item.disableCondField);

      return !(value === item.disableCondValue);
    }
    if (item?.disableBasedOn && this?.data[item?.disableBasedOn]) {
      return true;
    }
    return false;
  }

  displayConditionBased(item) {
    if (this.isView && item.type === 'password') {
      return false;
    }
    if (item.dispCondField) {
      if (typeof item.dispCondField === 'object') {
        return item.dispCondField.every((element) => {
          const value = _.get(this[item.dispCondPar], element);

          return value === item.dispCondValue[element];
        });
      } else {
        const value = _.get(this[item.dispCondPar], item.dispCondField);

        if (item.dispCondValue[item.dispCondField]?.in) {
          return item.dispCondValue[item.dispCondField].in.includes(value);
        }
        return value === item.dispCondValue;
      }
    }

    if (item.dispNotCondField) {
        const value = _.get(this[item.dispCondPar], item.dispNotCondField);
        if(!value) {
          return false;
        }
        return !(value === item.dispNotCondValue);
    }
    return true;
  }

  displayAddButton (item) {
    const value = _.get(this['data'], item.displayCondField);

    if (item.showButton && item.displayCondValue.includes(value)) {
      return true;
    }
    return false;
  }

  updateButtonProperties() {
    if (this.handlers?.buttonName) {
      const buttonTitle = this.handlers.buttonName();
      this.iconType = buttonTitle === 'Add' ? 'plus' : (this.isView ? 'edit' : 'edit-white');
      this.buttonTitle = buttonTitle;
    }
  }
  printError(formGroup, item) {
    console.log(JSON.stringify(formGroup.controls[item.field]?.errors || {}));
  }

  shouldDisplayAsterisk(item): boolean {
    const parCond = _.get(this[item.disableCondPar], item.disableCondField);

    if (item.required) {
      if (!item.disableCondField || (item.disableCondField && parCond)) {
        return true;
      }
    }

    return false;
  }

  onFileSelected(event, item) {
    if (
      this.handlers &&
      typeof this.handlers[item.onFileSelected] === 'function'
    ) {
      this.handlers[item.onFileSelected](event, item.field);
    }
  }

  showBasedOn(fields) {
    if (fields && fields.length) {
      for (const field of fields) {
        if (!this.data[field]) {
          return false;
        }
      }
    }

    return true;
  }

  onClick(item) {
    if (!item.clickHandler || (this.isView && !item.showOnView)) {
      return;
    }
    if (
      this.handlers &&
      typeof this.handlers[item.clickHandler] === 'function'
    ) {
      return this.handlers[item.clickHandler](this.data);
    }
  }

  selectionChange(item) {
    if (this.data) {
      this.data[item.field] = this.formGroup.get(item.field).value;
    }
    if (!item.selectionChange) {
      return;
    }
    if (
      this.handlers &&
      typeof this.handlers[item.selectionChange] === 'function'
    ) {
      this.handlers[item.selectionChange](this.formGroup, item, this.data[item.field], 'fromSelectionChange');
    }
  }

  handleChange(option, item) {
    if (!option) {
      if (this.handlers && typeof this.handlers[item.toggle] === 'function' && this.isEdit) {
        this.handlers[item.toggle](item);
      }
      return;
    }

    if (item.handleSelectionChange) {
      let previousValue = this.previousValues[item.field];
      let currentValue = this.formGroup.get(item.field).value;
      let selectedValue = option[item.selectValue];
      if (currentValue === previousValue) {
        this.handlers[item.selectionChange](this.formGroup, item, this.data[item.field], 'fromHandleChange');
      }
    }    
  }

  getTooltipText(item) {
    if (item.toolTip) {
      return item.toolTip;
    }

    if (item.dynamicToolTip) {
      return this.formGroup.get(item.field).value;
    }
  }
  getViewData(item) {
    if (item.pipe) {
      return this.pipeService.pipes[item.pipe](this.data[item.field]);
    }
    if (item.selectLabel && this.requiredData[item.selectData]) {
      const value = this.requiredData[item.selectData].find((x) => {
        const val = item.showLabel === true ? x.value : x._id;

        return this.data[item.field] === val;
      });

      return (value && value[item.selectLabel]) || this.data[item.field] || '-';
    }

    return this.data[item.field] || '-';
  }

  sortData(item, data) {
    if (data && data.length) {
      if (item.selectData === 'valueOptions') return data.sort();
      else
        return data.sort((a, b) =>
          a[item.selectLabel]?.localeCompare(b[item.selectLabel]),
        );
    }
  }
  
  filterDataByContext(data, item) {
    if (!data) return [];
    let context = item.context;
    const selectedDataType = this.data[context];

    if (this.data.dataType === 'String' || this.data.dataType === 'Boolean') {
      return data.filter(entry => entry.context === selectedDataType || !entry.context);
    }
    if (item.selectData === "TransformType") {
      return data.filter(entry => entry.context === selectedDataType);
    }
    if (item.field === "format" && this.data.transform !== "DateTransform") {
      return data.filter(entry => entry.context === "RCX-Format");
    }
    if (item.field === 'transformExpr' && item.selectData === 'DateFormatType') {
      return data
        .filter(entry => entry.context === "RCX-Format")
        .filter(entry => !this.data.format || entry.value !== this.data.format)
    }
    return data;
  }
  
  clickHandler(event: any, item: any): any {
    if (item.selectAllOnClick) {
      return event.target.select();
    }
  }

  onInputChange(event, element) {
    const value = event.target.value;

    if(element.type === 'number'){
      event.target.value = Number(value);
    }
    if (element.regex) {
      const regexPattern = RegExp(element.regex);

      if (!regexPattern.test(value)) {
        event.target.value = '';
      }
    }
    if (
      this.handlers &&
      typeof this.handlers[element.changeHandler] === 'function'
    ) {
      this.handlers[element.changeHandler](this.formGroup);
    }
  }

  dateTimeChange(event, item) {
    const selectedDateTime = event.value;

    if (item.minDate && selectedDateTime) {
      const currentDate = new Date();

      if (
        selectedDateTime.getDate() === currentDate.getDate() &&
        selectedDateTime < currentDate
      ) {
        selectedDateTime.setHours(
          currentDate.getHours(),
          currentDate.getMinutes(),
          0,
          0,
        );
        this.formGroup.controls[item.field].setValue(
          selectedDateTime.toISOString(),
        );
      }
    }
  }

  getDate(item) {
    if (item.minDate) {
      const currDate = new Date().getTime();
      const scheduledDate = new Date(
        this.formGroup.value.effectiveDate ?? currDate,
      ).getTime();

      return this.isEdit && currDate > scheduledDate
        ? this.formGroup.value.effectiveDate
        : new Date();
    }
  }

  getMaxDate() {
    const maxDate = new Date(2099, 11, 31);

    maxDate.setHours(11, 59, 0, 0);

    return maxDate;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
