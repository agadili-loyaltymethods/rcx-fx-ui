import { TestBed } from '@angular/core/testing';

import { IntegrationUtilsService } from './integration-utils.service';

describe('IntegrationUtilsService', () => {
  let service: IntegrationUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
