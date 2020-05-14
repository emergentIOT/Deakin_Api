import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedComponent } from './featured.component';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
  selector: 'des-card',
  template: ''
})
class MockDesCardComponent {}

describe('FeaturedComponent', () => {
  let component: FeaturedComponent;
  let fixture: ComponentFixture<FeaturedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // TODO: Mock FeaturedCardService instead
      ],
      declarations: [
        FeaturedComponent,
        MockDesCardComponent // TODO: consider wrapping desCardComponent so it can be automocked
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
