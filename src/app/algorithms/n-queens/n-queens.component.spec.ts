import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NQueensComponent } from './n-queens.component';

describe('NQueensComponent', () => {
  let component: NQueensComponent;
  let fixture: ComponentFixture<NQueensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NQueensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NQueensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
