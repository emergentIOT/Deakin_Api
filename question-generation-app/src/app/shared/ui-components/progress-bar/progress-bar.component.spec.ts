import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressBarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a non-zero length for valid inputs', () => {
    component.min = 0;
    component.max = 200;
    component.value = 77;
    fixture.detectChanges();
    const elem = fixture.debugElement.query(By.css('.bar-value')).nativeElement;
    const elemWidth = window.getComputedStyle(elem).getPropertyValue('width');
    expect(elemWidth).not.toEqual('0px');
  });

  it('should have zero length if min is unset', () => {
    component.min = undefined;
    component.max = 200;
    component.value = 77;
    fixture.detectChanges();
    const elem = fixture.debugElement.query(By.css('.bar-value')).nativeElement;
    const elemWidth = window.getComputedStyle(elem).getPropertyValue('width');
    expect(elemWidth).toEqual('0px');
  });

  it('should have zero length if max is unset', () => {
    component.min = 0;
    component.max = undefined;
    component.value = 77;
    fixture.detectChanges();
    const elem = fixture.debugElement.query(By.css('.bar-value')).nativeElement;
    const elemWidth = window.getComputedStyle(elem).getPropertyValue('width');
    expect(elemWidth).toEqual('0px');
  });

  it('should have zero length if value is unset', () => {
    component.min = 0;
    component.max = 200;
    component.value = undefined;
    fixture.detectChanges();
    const elem = fixture.debugElement.query(By.css('.bar-value')).nativeElement;
    const elemWidth = window.getComputedStyle(elem).getPropertyValue('width');
    expect(elemWidth).toEqual('0px');
  });

  it('should have zero length if min > max', () => {
    component.min = 300;
    component.max = 200;
    component.value = 77;
    fixture.detectChanges();
    const elem = fixture.debugElement.query(By.css('.bar-value')).nativeElement;
    const elemWidth = window.getComputedStyle(elem).getPropertyValue('width');
    expect(elemWidth).toEqual('0px');
  });
});
