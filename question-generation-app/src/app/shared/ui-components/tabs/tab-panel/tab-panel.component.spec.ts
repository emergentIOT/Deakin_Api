import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";

import { TabPanelComponent } from './tab-panel.component';


describe('TabPanelComponent', () => {
  let component: TabPanelComponent;
  let fixture: ComponentFixture<TabPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TabPanelComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.title = "My Units"
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set the correct aria label based on the title', () => {
      component.title = "My Units"

      fixture.detectChanges();

      const ariaLabel = fixture.debugElement.query(By.css('div'))
                          .nativeElement.getAttribute('aria-labelledby');
      // console.log(ariaLabel);
      expect(ariaLabel).toContain('myunits');
  });

});
