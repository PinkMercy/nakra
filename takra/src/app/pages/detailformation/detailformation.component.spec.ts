import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailformationComponent } from './detailformation.component';

describe('DetailformationComponent', () => {
  let component: DetailformationComponent;
  let fixture: ComponentFixture<DetailformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
