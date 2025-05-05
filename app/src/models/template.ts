import { sharedConstants } from '../shared';
import { Partner } from './partner';

class FilePropertyDef {
  format: string;
  delimiter: string;
  quoteStrings: string;
  body: boolean;
  header: boolean;
  footer: boolean;

  constructor() {
    this.format = 'Delimited';
    this.delimiter = ',';
    this.header = false;
    this.body = true;
    this.footer = false;
    this.quoteStrings = "'";
  }
}

class FieldPropertyDef {
  fieldName: string;
  sequence: number;
  fixedLength: number;
  dataType: string;
  format: string;

  constructor() {
    this.fieldName = sharedConstants.defaultFieldName;
    this.sequence = 1;
    this.dataType = 'String';
  }
}

export class InputFileProperties extends FilePropertyDef {
  headerRegex: string;
  footerRegex: string;
  bodyRegex: string;

  constructor() {
    super();
  }
}

export class InputFieldDefs extends FieldPropertyDef {
  required: boolean;
  defaultValue: string;
  minLength: number;
  maxLength: number;
  minValue: number;
  maxValue: number;
  comments: string;

  constructor() {
    super();
    this.required = false;
  }
}

export class InputBodyFieldDefs extends InputFieldDefs {
  editable: boolean;
  autoFixable: boolean;
  rcxField: string;
  uniqueKeyFlag: boolean;
  transform: string;
  rcxFieldArrLen: number;
  parentType: string;
  sysDate: boolean;
  uuid: boolean;
  fromFile: boolean;
  
  constructor() {
    super();
    this.editable = false;
    this.autoFixable = false;
    this.uniqueKeyFlag = false;
    this.sysDate = false;
    this.uuid = false;
    this.fromFile = true;
  }
}

export class ResponseBodyFieldDefs extends FieldPropertyDef {
  value: string;
  transform: string;
}

export class ResponseFieldDefs extends FieldPropertyDef {
  aggregate: string;
  value: string;

  constructor() {
    super();
    this.aggregate = 'None';
  }
}

export class InputFileLayout {
  fileProperties: InputFileProperties;
  bodyFieldDefs: [InputBodyFieldDefs];
  headerFieldDefs: [InputFieldDefs];
  footerFieldDefs: [InputFieldDefs];

  constructor() {
    this.fileProperties = new InputFileProperties();
    this.bodyFieldDefs = [new InputBodyFieldDefs()];
    this.headerFieldDefs = [new InputFieldDefs()];
    this.footerFieldDefs = [new InputFieldDefs()];
  }
}

export class ResponseFileLayout {
  fileProperties: FilePropertyDef;
  bodyFieldDefs: [ResponseBodyFieldDefs];
  headerFieldDefs: [ResponseFieldDefs];
  footerFieldDefs: [ResponseFieldDefs];

  constructor() {
    this.fileProperties = new InputFileProperties();
    this.bodyFieldDefs = [new ResponseBodyFieldDefs()];
    this.headerFieldDefs = [new ResponseFieldDefs()];
    this.footerFieldDefs = [new ResponseFieldDefs()];
  }
}

export class Template {
  name: string;
  description: string;
  status: string;
  rcxProcess: string;
  partner: Partner | any;
  inputFileLayout: InputFileLayout;
  responseFileLayout: ResponseFileLayout;
  updatedBy: any;
  updatedAt: any;
  _id: any;

  constructor() {
    this.status = 'Revision';
    // this.partner = new Partner();
    this.inputFileLayout = new InputFileLayout();
    this.responseFileLayout = new ResponseFileLayout();
  }
}