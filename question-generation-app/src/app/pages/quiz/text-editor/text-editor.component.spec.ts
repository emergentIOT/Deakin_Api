import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorComponent } from './text-editor.component';

describe('TextEditorComponent', () => {
  let component: TextEditorComponent;
  let fixture: ComponentFixture<TextEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('select text multi words', () => {
    let str = component.selectTokenInText("two three four", "one two three four five six");
    console.log("selectTokenInText", str);
    console.log(component.selectTokenInText("two three four", str));
  });
});
