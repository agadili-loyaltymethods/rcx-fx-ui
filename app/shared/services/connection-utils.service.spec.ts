import { TestBed } from '@angular/core/testing';
import { ConnectionUtils } from './connection-utils.service';

describe('ConnectionUtils', () => {
  let service: ConnectionUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
