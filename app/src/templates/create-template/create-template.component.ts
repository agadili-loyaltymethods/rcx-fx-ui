import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { Partner } from 'src/app/models/partner';
import {
  InputBodyFieldDefs,
  InputFieldDefs,
  ResponseBodyFieldDefs,
  ResponseFieldDefs,
  Template,
} from 'src/app/models/template';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';
import { IntegrationsService } from 'src/app/shared/services/integrations.service';
import { PartnersService } from 'src/app/shared/services/partners.service';
import { ProgramsService } from 'src/app/shared/services/programs.service';
import { TemplatesService } from 'src/app/shared/services/templates.service';
import { ConfirmationDialog } from '../../common-components/delete-button/confirmation-dialog.component';
import { sharedConstants } from '../../shared';
import { Service } from '../../shared/services/service';
import { DateFormatInfoComponent } from '../common/date-format-info/date-format-info.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { TemplatePropertiesTreeSectionComponent } from '../common/template-properties-tree-section/template-properties-tree-section.component';

@Component({
  selector: 'app-create-template',
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateTemplateComponent {
  private readonly defaultDateFormat: string =
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z";

  public menuCallback: Function;
  @ViewChild('drawer') drawer;
  @ViewChild('templatePropertiesTreeSectionComponent') templatePropertiesTreeSectionComponent: TemplatePropertiesTreeSectionComponent;

  formGroup = new FormGroup([]);
  options = ['Option 1', 'Option 2', 'Option 3'];
  showFiller = true;
  durationInSeconds = 4;
  headerData = {
    headerName: 'Integration Properties',
  };

  showProperties = 'template-properties';
  updateNodeCallback: Function;
  properties = new Template();
  propertiesData: any = {};
  activeFieldDetails: any;
  data: any;
  comparisionExclusionFields = ['partner'];
  propertiesMap = {
    'Input File': 'inputFileLayout',
    'Response File': 'responseFileLayout',
    'File Properties': 'fileProperties',
    Header: 'headerFieldDefs',
    Footer: 'footerFieldDefs',
    Body: 'bodyFieldDefs',
  };

  errors: any = [];
  routeSub: Subscription;
  sub: Subscription;
  isEdit = false;
  isView = false;
  isRevision = false;
  partners: Partner[];
  enumData: any = {};
  config:any = {};
  invalidDateTypeFormat: any = {}
  originalEnumData: any = {};
  rcxField: any = '';
  isModified = false;
  templateId: any;
  deletePermission: boolean;
  
  modelMap = {
    'Input File-Header': InputFieldDefs,
    'Input File-Body': InputBodyFieldDefs,
    'Input File-Footer': InputFieldDefs,
    'Response File-Header': ResponseFieldDefs,
    'Response File-Body': ResponseBodyFieldDefs,
    'Response File-Footer': ResponseFieldDefs,
  };

  handlers = {
    openDialog: this.openDialog.bind(this),
    resetFormat: this.resetFormat.bind(this),
    resetTransform: this.resetTransform.bind(this),
    resetFixedLenth: this.resetFixedLenth.bind(this),
    handleIsModifiedChange: this.handleIsModifiedChange.bind(this),
  };

  rcxSchemas = {};

  constructor(
    private ref: ChangeDetectorRef,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private pipeService: DynamicPipeService,
    public dialog: MatDialog,
    private drawerService: DrawerService,
    private location: Location,
    private templatesService: TemplatesService,
    private partnersService: PartnersService,
    private programsService: ProgramsService,
    private integrationsService: IntegrationsService,
    private service: Service,
    private auth: AuthService,
    private uiConfigService: UiConfigService,
    public utilsService: UtilsService, //this is used in HTML file, please don't remove it
  ) {}

  public async ngOnInit() {
    this.config = await this.uiConfigService.getFormViewConfig('templates');
    this.invalidDateTypeFormat = this.config?.invalidDateTypeFormat;
    this.deletePermission = await this.utilsService.checkPerms({FX_IntegrationTemplate:['delete']})
    this.menuCallback = this.onMenuClick.bind(this);
    this.updateNodeCallback = this.updateNodeData.bind(this);
    this.rcxSchemas = (await firstValueFrom(this.service.getSchema())) || {};
    this.sub = this.route.paramMap.subscribe(async params => {
      this.templateId = params.get("id");
    });
    this.propertiesData = await this.getIntegrationTemplate();
    this.routeSub = this.route.url.subscribe((url) => {
      this.isEdit = url[0]?.path === 'edit';
      this.isView = url[0]?.path === 'detail';
    });
    if (this.propertiesData && this.isEdit) {
      this.propertiesData.status = 'Revision';
    }
    this.getPartners();
    this.getRequiredEnums();
    if (this.propertiesData && Object.keys(this.propertiesData).length > 1) {
      this.properties = JSON.parse(JSON.stringify(this.propertiesData));
    }
    this.isRevision = this.properties.status === 'Revision';
    if (this.properties?.inputFileLayout?.bodyFieldDefs?.length) {
      let finalData = this.alignIndex(this.properties.inputFileLayout.bodyFieldDefs);
      Object.assign(this.properties.inputFileLayout.bodyFieldDefs, finalData);
      this.properties.inputFileLayout.bodyFieldDefs.forEach((bodyField) => {
        if (bodyField?.rcxFieldArrLen > 0) {
          bodyField.parentType = 'array';
        } else if (bodyField.parentType) {
          delete bodyField.parentType;
        }
      });
    }
    this.data = this.data || {};
    this.enumData = {};
    this.drawerService.setDrawerState(false);
  }

  alignIndex(fields) {
    const arrFieldIndexMap = {}, groupedFields = [];
      let index = -1;
      fields.forEach((field) => {
        if (field['arrField']) {
          let arrFieldIndex = arrFieldIndexMap[field['arrField'] + 'Index'];
          if (arrFieldIndex >= 0) {
            groupedFields[arrFieldIndex].arrFields.push(field);
          } else {
            arrFieldIndexMap[field['arrField'] + 'Index'] = ++index;
            field['arrFields'] = [];
            groupedFields.push(field);
          }
        } else {
          index++;
          groupedFields.push(field);
        }
      });
      let updatedSequence = 1;
      const finalBodyFields = [];
      groupedFields.forEach((field) => {
        let arrFields = [];
        if (field.arrFields?.length) {
          arrFields = field.arrFields;
          delete field.arrFields;
        }
        field.sequence = updatedSequence++;
        finalBodyFields.push(field);
        arrFields.forEach((field) => {
          field.sequence = updatedSequence++;
          finalBodyFields.push(field);
        })
      });
      return finalBodyFields;
  }

  editTemplate(row) {
    row.status = 'Revision';
    this.router.navigate([`templates/edit/${row._id}`], { state: { properties: row } });
  }

  async edit() {
    const row = JSON.parse(JSON.stringify(this.properties));
    const query = JSON.stringify({ template: row._id });
    const depIntegrations = await firstValueFrom(
      this.integrationsService.getIntegrations({ query }),
    );
    const validStatuses = ['Paused', 'Publish Pending', 'Published'];
    const hasValidIntegrationStatus = depIntegrations.some(item => validStatuses.includes(item.status));

    if (row.status === 'Published' && depIntegrations.length) {
      if (hasValidIntegrationStatus) {
        this.dialog.open(ConfirmationDialog, {
          data: {
            schema: 'Warning',
            content: `Unable to edit template <strong>${row.name}</strong>, as it is used in one or more integrations.`,
            confirmButton: 'Close',
            disableCancelButton: true,
          },
        });
      } else {
        this.dialog.open(ConfirmationDialog, {
          data: {
            schema: 'Warning',
            content: `The template <strong>${row.name}</strong> is currently utilized in one or more integrations, meaning that any modifications to the template will impact the execution of these integrations. Would you like to proceed?`,
            confirmButton: 'Yes',
            cancelButton: 'Cancel',
            confirmation: () => this.editTemplate(row),
          },
        });
      }
    } else {
      this.editTemplate(row);
    }
  }

  delete(): void {
    if (!this.deletePermission) {
      return;
    }
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: this.properties,
        schema: 'Delete Template',
        content: `Are you sure that you want to delete <strong>${this.properties.name}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        confirmation: this.confirmationDialog.bind(this),
      },
    });
  }

  async confirmationDialog(row) {
    try {
      await firstValueFrom(this.templatesService.deleteTemplates(row));
      this.alertService.successAlert('Template deleted successfully');
      this.isModified = false;
      this.navigate();
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'Cannot delete template',
      );
    }
  }

  async getIntegrationTemplate() {
    let propertyId = this.templateId;
    if (propertyId) {
      const query = JSON.stringify({
        _id: propertyId,
      });
      const populate = JSON.stringify({ path: 'updatedBy', select: 'login' });

      try {
        return ((await firstValueFrom(
          this.templatesService.getTemplates({ query, populate }),
        )) || [{}])[0];
      } catch (err) {
        this.alertService.errorAlert(
          (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
        );
      }
    }

    return {};
  }

  getSelectedProperty(activeFieldDetails) {
    return `${activeFieldDetails.activeFileName}${
      activeFieldDetails?.activeSectionName
        ? '-' + activeFieldDetails?.activeSectionName
        : ''
    }`;
  }

  getFormattedDate(dateTime) {
    if (dateTime) {
      return this.pipeService.pipes.dateTimeFormat(dateTime);
    }
  }

  async getPartners() {
    try {
      const data = await firstValueFrom(
        this.partnersService.getPartners({ select: 'name' }),
      );

      this.partners = data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getRequiredEnums() {
    const queryObj = {
      query: JSON.stringify({
        type: {
          $in: ['RCXProcess', 'MathFuncs', 'DataType', 'DateFormatType', 'TransformType'],
        },
        lang: 'en',
      }),
      select: 'label,value,type,data,context',
    };
    const enums = await firstValueFrom(this.programsService.getEnums(queryObj));

    enums.forEach((x) => {
      if (!this.enumData[x.type]) {
        this.enumData[x.type] = [];
      }
      if (!this.originalEnumData[x.type]) {
        this.originalEnumData[x.type] = [];
      }
      this.originalEnumData[x.type].push(x);
      this.enumData[x.type].push(x);
    });
  }

  onMenuClick(activeFieldDetails) {
    this.activeFieldDetails = activeFieldDetails;
    const selectProperties = this.getSelectedProperty(activeFieldDetails);
    const par1 = activeFieldDetails.activeFileName;
    const par2 = activeFieldDetails?.activeSectionName;
    let value;

    if (par2) {
      const key =
        this.propertiesMap[par1.toString()] +
        '.' +
        this.propertiesMap[par2.toString()];

      value = _.get(this.properties, key);
      if (!key.includes('fileProperties')) {
        value = value[activeFieldDetails.activeIndex || 0];
      }
    } else {
      value = this.properties;
    }
    this.showProperties = selectProperties.toLowerCase().replaceAll(' ', '-');
    this.data = JSON.parse(JSON.stringify(value || {}));
    this.data = {...this.data};
  }

  deleteByIndex(arr, indexToRemove, index?) {
    const key =  index || 'index';
    return arr.filter((ele) => {
      if (ele?.children?.length) {
        let res = ele.children.filter((e) => {
          if (e[key] !== indexToRemove) {
            return e;
          }
        });
        if (res.length) {
          ele.children = res;
          return ele;
        }
      } else if (ele[key] !== indexToRemove) {
        return ele;
      }
    });
  }

  updateNodeData(
    activeFieldDetails,
    isAdding,
    duplicated = false,
    dragged = false,
  ) {
    const selectProperties = this.getSelectedProperty(activeFieldDetails);
    const keys = selectProperties.split('-');
    const isInput = keys[0].startsWith('Input');
    const component = keys[1];
    let finalKey =
      this.properties[(isInput ? 'input' : 'response') + 'FileLayout'][
        component.toLowerCase() + 'FieldDefs'
      ];

    if (dragged) {
      const prevValue = finalKey.splice(activeFieldDetails?.prevIndex, 1);
      finalKey.splice(activeFieldDetails?.currIndex, 0, prevValue[0]);
      this.data = finalKey[activeFieldDetails?.activeIndex];
      finalKey.forEach((node, i) => (node.sequence = i + 1));
      if (isInput && component.toLowerCase() === 'body') {
        this.templatePropertiesTreeSectionComponent.generateTree(activeFieldDetails?.activeIndex, activeFieldDetails.arrayElement);
      }
      return;
    }
    if (!duplicated) {
      if (isAdding) {
        const value = Object.assign({}, new this.modelMap[selectProperties]());

        value.sequence = finalKey.length + 1;
        finalKey.push(value);
        this.data = finalKey[activeFieldDetails.activeIndex];
      } else {
        if (activeFieldDetails.removedIndex === -1) {
          finalKey.splice(0, 1);
          const value = Object.assign(
            {},
            new this.modelMap[selectProperties](),
          );

          finalKey.push(value);
        } else {
          const res = this.deleteByIndex(finalKey, activeFieldDetails.removedIndex+1, 'sequence');
          this.properties[(isInput ? 'input' : 'response') + 'FileLayout'][
            component.toLowerCase() + 'FieldDefs'
          ] = res;
          finalKey = this.properties[(isInput ? 'input' : 'response') + 'FileLayout'][
            component.toLowerCase() + 'FieldDefs'
          ];
          activeFieldDetails.removedIndex = -1;
        }

        finalKey.forEach((node, i) => (node.sequence = i + 1));
        this.data = finalKey[activeFieldDetails.activeIndex];
      }
    } else {
      const value = Object.assign({}, finalKey[activeFieldDetails.copiedIndex]);
      if (activeFieldDetails.nestedActiveSectionName) {
        let finalData = [], isSequenceUpdated = false, sequence = activeFieldDetails.activeIndex + 1;
        finalKey.forEach((key) => {
          if (key.sequence === activeFieldDetails.activeIndex + 1) {
            isSequenceUpdated = true;
            value.sequence = sequence;
            finalData.push(value);
          }
          if (isSequenceUpdated) {
            key.sequence = ++sequence;
          }
          finalData.push(key);
          return key;
        });
        this.properties[(isInput ? 'input' : 'response') + 'FileLayout'][
          component.toLowerCase() + 'FieldDefs'
        ] = finalData;
        finalKey = this.properties[(isInput ? 'input' : 'response') + 'FileLayout'][
          component.toLowerCase() + 'FieldDefs'
        ];
      } else {
        value.sequence = finalKey.length + 1;
        finalKey.push(value)
      }
      this.data = value;
    }
  }

  getClassName() {
    return `status status-${this.properties.status
      ?.toLowerCase()
      .split(' ')
      .join('')}`;
  }

  async publish() {
    this.properties.status = 'Published';

    return this.save(true);
  }

  onDrawerClosed() {
    this.drawerService.setDrawerState(false);
  }

  closeErrorPanel() {
    if (this.drawerService.getDrawerState()) {
      this.drawerService.setDrawerState(false);
      this.drawer.toggle();
    }
  }

  async validate() {
    this.closeErrorPanel();
    try {
      await firstValueFrom(
        this.templatesService.postIntegrationTemplate(
          this.utilsService.filterTemplateData(JSON.parse(JSON.stringify(this.properties))),
          this.isEdit,
          true,
        ),
      );
      if (this.drawerService.getDrawerState()) {
        this.drawerService.setDrawerState(false);
        this.drawer.toggle();
      }
      this.alertService.successAlert('Template validation successful');
    } catch (err) {
      this.errors = err?.errors || [];
      if (this.errors.length) {
        if (!this.drawerService.getDrawerState()) {
          this.drawerService.setDrawerState(true);
          this.drawer.toggle();
        }
      } else {
        this.alertService.errorAlert('Template validation failed');
      }
    }
  }

  async testFile() {
    this.closeErrorPanel();
    this.dialog.open(ConfirmationDialog, {
      data: {
        confirmationButton: 'Test',
        schema: 'Validation',
        getInput: true,
        header: 'Upload Sample File',
        placeHolder: 'Upload Sample File',
        inputType: 'file',
        dialogType: 'testFile',
        confirmationWithData: this.confirmationWithData.bind(this),
      },
    });
  }

  //@ts-ignore
  async confirmationWithData(data, file) {
    try {
      if (file) {
        const formData = new FormData();

        formData.append('file', file, file.name);
        formData.append('templateId', this.properties._id);
        await firstValueFrom(this.templatesService.validateFile(formData));
        this.alertService.successAlert(sharedConstants.fileValidationSuccess);
      }
    } catch (err) {
      this.errors = err.errors || [];
      if (this.errors.length) {
        if (!this.drawerService.getDrawerState()) {
          this.drawerService.setDrawerState(true);
          this.drawer.toggle();
        }
      } else {
        this.alertService.errorAlert(
          err.errorMessage || sharedConstants.fileValidationFail,
        );
      }
    }
  }

  handleIsModifiedChange(isModified: boolean) {
    this.isModified = isModified;
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (!this.isModified) {
      return true;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        schema: 'Unsaved Changes',
        content: `There are unsaved changes. Exit without saving?`,
        confirmButton: 'Proceed',
        cancelButton: 'Cancel',
      },
    });

    return dialogRef.afterClosed();
  }

  markAsTouched() {
    Object.keys(this.formGroup?.controls || []).forEach((controlName) => {
      this.formGroup.get(controlName).markAsTouched();
    });
  }

  async save(fromPublish?: boolean) {
    this.closeErrorPanel();
    if (!fromPublish) {
      this.properties.status = 'Revision';
    }
    try {
      this.properties.partner =
        this.properties.partner?._id || this.properties.partner;
      
      const filteredData = this.utilsService.filterTemplateData(JSON.parse(JSON.stringify(this.properties)));
      
      let templateProperties = await firstValueFrom(
        this.templatesService.postIntegrationTemplate(
          filteredData,
          this.isEdit,
          false,
        ),
      );
      this.templateId = templateProperties._id;

      let userDetails = await this.auth.getUser()
      if(userDetails.id === this.properties?.updatedBy?._id) {
        this.properties.updatedBy.login = userDetails.login
        templateProperties = this.properties
      } else {
        templateProperties = await this.getIntegrationTemplate();
        const updatedByChanged =
          this.properties.updatedBy?._id !== templateProperties.updatedBy?._id;
        this.properties.updatedBy = templateProperties.updatedBy;
        if (updatedByChanged) {
          this.propertiesData = templateProperties;
          this.properties = { ...this.propertiesData };
        }
      }
      this.alertService.successAlert(
        `Template successfully ${fromPublish ? 'published' : 'saved'}`,
      ); // msg has to modify
      this.isModified = false;
      if (fromPublish) {
        this.router.navigate(['templates/list'], {
          state: { disableDeactivateGuard: true },
        });
      } else {
        if (templateProperties?.inputFileLayout?.bodyFieldDefs?.length) {
          templateProperties.inputFileLayout.bodyFieldDefs.forEach(
            (bodyField) => {
              if (bodyField?.rcxFieldArrLen > 0) {
                bodyField.parentType = 'array';
              } else if (bodyField.parentType) {
                delete bodyField.parentType;
              }
            },
          );
        }
        Object.assign(this.properties, templateProperties);
        Object.assign(this.propertiesData, templateProperties);
        this.router.navigate([`templates/edit/${this.properties._id}`],{
        state: {
          source: 'templates',
        },
      });
      }
    } catch (err) {
      this.properties.status = 'Revision';
      this.errors = err?.errors || [];
      if (!this.drawerService.getDrawerState()) {
        this.drawerService.setDrawerState(true);
        this.drawer.toggle();
      }
    }
  }

  openDialog() {
    this.dialog.open(DateFormatInfoComponent);
  }

  resetFormat() {
    if (this.data) {
      this.data = { ...this.data };
      this.data.format = '';
      if (this.data.transform) {
        delete this.data.transform;
        delete this.data.transformExpr;
        delete this.data.transformExprField;
      }      
      if (this.data.dataType === 'Number') {
        this.data.format = '0';
        this.data.minValue = '1';
        this.data.maxValue = '10';
      }
      if (this.data.dataType === 'Date') {
        this.data.format = this.defaultDateFormat;
      }
      if (this.data.dataType === 'Date' && this.data.transform === 'DateTransform') {
        this.data.transformExpr = this.data.transformExpr || this.defaultDateFormat;
      }
      if (this.properties?.inputFileLayout?.bodyFieldDefs) {
        const fieldIndex = this.properties.inputFileLayout.bodyFieldDefs.findIndex(
          field => field.sequence === this.data.sequence
        );
        if (fieldIndex !== -1) {
          this.properties.inputFileLayout.bodyFieldDefs[fieldIndex] = {...this.data};
          this.properties.inputFileLayout.bodyFieldDefs = [...this.properties.inputFileLayout.bodyFieldDefs];
        }
  
      }
    }
  }

  resetTransform(formGroup: FormGroup, item, updatedValue, source) {
    if (this.data && source === 'fromSelectionChange') {
      this.formGroup = formGroup;
      item.fieldsToDelete?.forEach((field) => {
        delete this.data[field];
        this.formGroup.removeControl(field);
      })
      this.data[item.field] = updatedValue;
      this.data = {...this.data};
      if (this.data.dataType === 'Date' && this.data.transform === 'DateTransform') {
        this.data.transformExpr = this.defaultDateFormat;
        this.data.transformExprField = this.defaultDateFormat;
      }   
    } else if (source === 'fromHandleChange') {
      this.formGroup = formGroup;
      item.fieldsToDelete?.forEach((field) => {
        delete this.data[field];
        this.formGroup.removeControl(field);
      })
      delete this.data[item.field];
      this.data = {...this.data};
    }
    if (this.properties?.inputFileLayout?.bodyFieldDefs) {
      const fieldIndex = this.properties.inputFileLayout.bodyFieldDefs.findIndex(
        field => field.sequence === this.data.sequence
      );
      if (fieldIndex !== -1) {
        this.properties.inputFileLayout.bodyFieldDefs[fieldIndex] = {...this.data};
        this.properties.inputFileLayout.bodyFieldDefs = [...this.properties.inputFileLayout.bodyFieldDefs];
      }

    }
  }

  resetFixedLenth() {
    // if (this.data) {
    //   this.data = { ...this.data };
    //   const { format } = this.properties.inputFileLayout.fileProperties;
    //   const isUUID = this.data.UUID === true;
    //   this.data.fixedLength = format === 'Fixed' ? (isUUID ? 36 : '') : '';
    //   this.data.maxLength = isUUID ? 36 : 100;
    // }
  }

 
  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.sub.unsubscribe();
  }

  navigate() {
    if (history.state?.source !== 'templates') {
      this.location.back();
    } else {
      this.router.navigate(['templates/list']);
    }
  }

  updateFormGroup(formGroup, key?: string) {
    this.formGroup = formGroup;
    let rcxProcess = this.properties.rcxProcess;
    if (this.rcxField !== rcxProcess && this.enumData?.DateFormatType?.length && this.originalEnumData?.DateFormatType?.length) {
      this.rcxField = rcxProcess;
      if (Object.keys(this.invalidDateTypeFormat).includes(rcxProcess)) {
        this.enumData.DateFormatType = this.originalEnumData.DateFormatType.filter((dateFormat) => {
          if(!this.invalidDateTypeFormat[rcxProcess].includes(dateFormat.label)) {
            return dateFormat;
          }
        })
      } else {
        this.enumData.DateFormatType = this.originalEnumData.DateFormatType;
      }
    }
    this.ref.detectChanges();
    if (key) {
      const splitKeys = key.split('.');
      let dataSource: any = [];
      if (splitKeys[1]) {
        if (Array.isArray(this.properties[splitKeys[0]][splitKeys[1]])) {
          const validIndex = this.templatePropertiesTreeSectionComponent?.arrFieldArrange(this.data);
          const formData = this.formGroup.getRawValue();
          const updatedData = {
            ...this.properties[splitKeys[0]][splitKeys[1]][this.activeFieldDetails.activeIndex],
            ...formData
          };
          
          // Handle transform data properly
          if (updatedData.transform) {
            if (updatedData.transform === 'DateTransform' && updatedData.dataType === 'Date') {
              updatedData.transformExpr = updatedData.transformExpr || this.defaultDateFormat;
              updatedData.transformExprField = updatedData.transformExpr;
            } else if (updatedData.transform === 'JoinTransform' || updatedData.transform === 'MappingTransform') {
              updatedData.transformExpr = updatedData.transformExpr || '';
              updatedData.transformExprField = updatedData.transformExprField || '';
            }
          }
          
          this.properties[splitKeys[0]][splitKeys[1]][
            this.activeFieldDetails.activeIndex
          ] = updatedData;
          
          if (validIndex && this.activeFieldDetails.activeIndex !== validIndex) {
            const val = this.properties[splitKeys[0]][splitKeys[1]].splice(this.activeFieldDetails.activeIndex, 1);
            this.properties[splitKeys[0]][splitKeys[1]].splice(validIndex, 0, val[0]);
            let sequence = 0;
            this.properties[splitKeys[0]][splitKeys[1]].forEach(ele => {
              ele.sequence = ++sequence;
            });
            this.data = val[0];
            let arrField = false;
            this.activeFieldDetails.activeIndex = validIndex;
            this.activeFieldDetails.activeFieldName = val[0].fieldName;
            if (val[0].arrField) {
              this.activeFieldDetails.nestedActiveSectionName = val[0].arrField;
              arrField = true;
            } else {
              delete this.activeFieldDetails.nestedActiveSectionName;
            }
            this.templatePropertiesTreeSectionComponent.generateTree(validIndex, arrField);
          }
        } else {
          const formData = this.formGroup.getRawValue();
          const updatedData = {
            ...this.properties[splitKeys[0]][splitKeys[1]],
            ...formData
          };
          this.properties[splitKeys[0]][splitKeys[1]] = updatedData;
        }
      } else {
        const formData = this.formGroup.getRawValue();
        const updatedData = {
          ...this.properties[key],
          ...formData
        };
        this.properties[key] = updatedData;
      }
    }
  }
}
