import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizListComponent } from './quiz-list.component';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
  selector: 'des-card',
  template: ''
})
class MockDesCardComponent {}

describe('QuizListComponent', () => {
  let component: QuizListComponent;
  let fixture: ComponentFixture<QuizListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // TODO: Mock QuizListCardService instead
      ],
      declarations: [
        QuizListComponent,
        MockDesCardComponent // TODO: consider wrapping desCardComponent so it can be automocked
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
