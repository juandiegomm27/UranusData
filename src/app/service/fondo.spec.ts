import { TestBed } from '@angular/core/testing';

import { FondoService } from './fondo';

describe('FondoService', () => {
  let service: FondoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FondoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
