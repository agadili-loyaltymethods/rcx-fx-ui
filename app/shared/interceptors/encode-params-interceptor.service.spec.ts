import { TestBed } from '@angular/core/testing';
import { EncodeHttpParamsInterceptorService } from './encode-params-interceptor.service';

describe('EncodeParamsInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EncodeHttpParamsInterceptorService = TestBed.get(
      EncodeHttpParamsInterceptorService,
    );

    expect(service).toBeTruthy();
  });
});
