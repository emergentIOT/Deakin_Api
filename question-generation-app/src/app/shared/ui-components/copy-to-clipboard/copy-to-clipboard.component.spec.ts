import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CopyToClipboardComponent } from './copy-to-clipboard.component';

describe('CopyToClipboardComponent', () => {
  let component: CopyToClipboardComponent;
  let fixture: ComponentFixture<CopyToClipboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CopyToClipboardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyToClipboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive css class for copy icon', () => {
    component.iconClass = 'fal fa-copy';

    fixture.detectChanges();
    const elem1 = fixture.debugElement.query(By.css('.fal')).nativeElement;
    const elemClass = elem1.getAttribute('class');

    expect(elemClass).toEqual('fal fa-copy');
  });

  it('should copy item received to copy', () => {
    component.itemToCopy = '9999999998';

    fixture.detectChanges();
    component.copyId();

    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
    navigator.clipboard.readText().then((text) => {
      expect(text).toContain('9999999998');
    });
  });
});
