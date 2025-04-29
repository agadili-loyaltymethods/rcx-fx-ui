import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { TokenInterceptorService } from './token-interceptor.service';

describe('TokenInterceptorService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [TokenInterceptorService],
    }),
  );

  it('should be created', () => {
    const service: TokenInterceptorService = TestBed.get(
      TokenInterceptorService,
    );

    expect(service).toBeTruthy();
  });
});
