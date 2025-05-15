import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsercalenderComponent } from './usercalender.component';

describe('UsercalenderComponent', () => {
  let component: UsercalenderComponent;
  let fixture: ComponentFixture<UsercalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsercalenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsercalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
