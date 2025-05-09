import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingstatsComponent } from './trainingstats.component';

describe('TrainingstatsComponent', () => {
  let component: TrainingstatsComponent;
  let fixture: ComponentFixture<TrainingstatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingstatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingstatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
