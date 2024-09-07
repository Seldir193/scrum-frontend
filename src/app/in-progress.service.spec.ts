import { TestBed } from '@angular/core/testing';

import { InProgressService } from './in-progress.service';

describe('InProgressService', () => {
  let service: InProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
