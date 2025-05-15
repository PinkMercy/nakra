import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationconfigComponent } from './formationconfig.component';

describe('FormationconfigComponent', () => {
  let component: FormationconfigComponent;
  let fixture: ComponentFixture<FormationconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationconfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
