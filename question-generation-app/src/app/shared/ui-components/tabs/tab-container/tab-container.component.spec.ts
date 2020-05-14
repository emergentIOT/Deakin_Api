import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TabContainerComponent } from './tab-container.component';
import { Component } from "@angular/core";
import { TabPanelComponent } from "../tab-panel/tab-panel.component";
import { By } from "@angular/platform-browser";

/**
 *
 * Readme why we need wrapper:
 * https://stackoverflow.com/questions/38479704/angular-2-unit-testing-component-mocking-contentchildren
 */
@Component({
  selector: 'app-tab-container-wrapper-component',
  template: `<app-tab-container>
    <app-tab-panel title="Tab 1">Content 1</app-tab-panel>
    <app-tab-panel title="Tab 2">Content 2</app-tab-panel>
  </app-tab-container>`
})
class TabContainerWrapperComponent { }

describe('TabContainerComponent', () => {
  let component: TabContainerComponent;
  let fixture: ComponentFixture<TabContainerWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TabContainerWrapperComponent,
        TabContainerComponent,
        TabPanelComponent
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabContainerWrapperComponent);
    component = fixture.debugElement.children[0].componentInstance
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('renders the correct number of tabs', () => {
    fixture.detectChanges();

    expect(component.tabs.length).toEqual(2);
  });

  it('automatically selects the first tab if none specifically loaded as active', () => {
    fixture.detectChanges();
    const firstTab = component.tabs.first;

    expect(firstTab.active).toBe(true);
  });

  it('automatically selects focus on a tab if one is specifically loaded as active', () => {
    fixture.detectChanges();
    const lastTab = component.tabs.last;
    component.tabs.filter = jasmine.createSpy().and.returnValue(lastTab);
    lastTab.active = true;

    component.ngAfterContentInit();

    expect(lastTab.active).toBe(true);
    expect(component.tabs.filter).toHaveBeenCalled();
  });

  it('should be able to select the correct tabs', () => {
    fixture.detectChanges();
    const firstTab = component.tabs.first;
    const lastTab = component.tabs.last;
    expect(firstTab.active).toBe(true);
    expect(lastTab.active).toBe(false);

    component.selectTab(lastTab);

    expect(lastTab.active).toBe(true);
    expect(firstTab.active).toBe(false);
  });

  it('it handles keyboard events correctly to select tabs',  () => {
    fixture.detectChanges();
    expect(component.tabs.first.active).toBe(true);
    expect(component.tabs.last.active).toBe(false);

    // fire keyboard event
    fixture.debugElement.query(By.css('button')) // first button
      .triggerEventHandler('keyup', {'key': 'ArrowRight'});

    expect(component.tabs.last.active).toBe(true);
    expect(component.tabs.first.active).toBe(false);
  });
});
