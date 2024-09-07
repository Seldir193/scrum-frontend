import { TestBed } from '@angular/core/testing';

import { TodayTaskService } from './today-task.service';

describe('TodayTaskService', () => {
  let service: TodayTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodayTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
