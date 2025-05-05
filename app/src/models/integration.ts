class Dependencies {
  name: string;
  type: string;
  list: [string];
}

class Alerts {
  name: string;
  type: string;
  email: string;
}

class Scheduling {
  effectiveDate: any;
  repeating: boolean;
  frequency: number;
  repeatInterval: number;
  controlRate: number;

  constructor() {
    this.repeating = false;
  }
}

export class InputProperties {
  connectionType: string;
  connection: string;
  inputMustExist: boolean;
  maxRetries: number;
  retryIntervalSeconds: number;
  path: string;
  archivePath: string;
  filePattern: string;

  constructor() {
    this.connectionType = '';
    this.connection = '';
    this.inputMustExist = false;
    this.path = '';
    this.archivePath = '';
    this.filePattern = '';
  }
}

export class ResponseProperties {
  connectionType: string;
  connection: string;
  filePattern: string;
  path: string;
  archivePath: string;

  constructor() {
    this.connectionType = '';
    this.connection = '';
    this.path = '';
    this.archivePath = '';
    this.filePattern = '';
  }
}
class ErrorCodeMapping {
  rcxErrorCode: string;
  partnerErrorCode: string;
  description: string;
}

class Parameters {
  name: string;
  type: string;
  value: string;
}

export class Integration {
  _id: string;
  name: string;
  description: string;
  status: string;
  partner: string | any;
  template: string;
  inputProperties: InputProperties;
  responseProperties: ResponseProperties;
  scheduling: Scheduling;
  alerts: [Alerts] | [];
  dependencies: [Dependencies] | [];
  errorCodeMapping: [ErrorCodeMapping] | [];
  parameters: [Parameters] | [];

  constructor() {
    this.status = 'Revision';
    this.inputProperties = new InputProperties();
    this.responseProperties = new ResponseProperties();
    this.scheduling = new Scheduling();
    this.alerts = [];
    this.dependencies = [];
    this.errorCodeMapping = [];
    this.parameters = [];
  }
}
