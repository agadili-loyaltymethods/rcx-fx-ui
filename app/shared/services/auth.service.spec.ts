import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [AuthService],
    }),
  );

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);

    expect(service).toBeTruthy();
  });
});
