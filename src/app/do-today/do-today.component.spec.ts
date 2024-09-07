import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoTodayComponent } from './do-today.component';

describe('DoTodayComponent', () => {
  let component: DoTodayComponent;
  let fixture: ComponentFixture<DoTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoTodayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
