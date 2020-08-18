import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IVideoListComponent } from './ivideo-list.component';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
  selector: 'des-card',
  template: ''
})
class MockDesCardComponent {}

describe('QuizListComponent', () => {
  let component: IVideoListComponent;
  let fixture: ComponentFixture<IVideoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // TODO: Mock QuizListCardService instead
      ],
      declarations: [
        IVideoListComponent,
        MockDesCardComponent // TODO: consider wrapping desCardComponent so it can be automocked
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IVideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
 