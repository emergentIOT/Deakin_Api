import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherComponent } from './other.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('OtherComponent', () => {
  let component: OtherComponent;
  let fixture: ComponentFixture<OtherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OtherComponent],
      schemas: [NO_ERRORS_SCHEMA] // Work around for not being able to automock StencilJS components
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
