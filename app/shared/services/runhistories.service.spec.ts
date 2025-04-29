import { TestBed } from '@angular/core/testing';

import { RunhistoriesService } from './runhistories.service';

describe('RunhistoriesService', () => {
  let service: RunhistoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunhistoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
