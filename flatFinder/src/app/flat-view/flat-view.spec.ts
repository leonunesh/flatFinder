import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatView } from './flat-view';

describe('FlatView', () => {
  let component: FlatView;
  let fixture: ComponentFixture<FlatView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatView],
    }).compileComponents();

    fixture = TestBed.createComponent(FlatView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
