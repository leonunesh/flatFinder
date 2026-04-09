import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatEdit } from './flat-edit';

describe('FlatEdit', () => {
  let component: FlatEdit;
  let fixture: ComponentFixture<FlatEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(FlatEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
