import { TestBed } from '@angular/core/testing';

import { DynamicPipeService } from './dynamic-pipe.service';

describe('DynamicPipeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicPipeService = TestBed.get(DynamicPipeService);

    expect(service).toBeTruthy();
  });
});
