import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
  Input,
  ViewChildren,
  ElementRef
} from '@angular/core';
import { TabPanelComponent } from '../tab-panel/tab-panel.component';

@Component({
  selector: 'app-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.scss']
})
export class TabContainerComponent implements AfterContentInit {
  @Input()
  label: string;

  @ContentChildren(TabPanelComponent)
  tabs: QueryList<TabPanelComponent>;

  @ViewChildren('tabButton')
  buttons: QueryList<ElementRef>;

  constructor() {}

  ngAfterContentInit() {
    // Get a list of the active tabs
    const activeTabs = this.tabs.filter((tab) => tab.active);

    // If there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: TabPanelComponent) {
    // Iterate over all of th tabs and deactivate them
    this.tabs.toArray().forEach((tabItem) => {
      tabItem.active = false;
    });

    // Activate the selected tab
    tab.active = true;
  }

  handleKeybNav(tabNumber: number, event: KeyboardEvent) {
    /**
     * The intended keyboard behaviour for left and right arrows is to
     * cycle continuously through the buttons in either direction.
     * First, determine if the current position is either the first or last
     * in the sequence, and also how many there are in total.
     * Each movement in either direction will update the element focus to
     * the next button and open the corresponding tab.
     */
    const isFirst: boolean = this.tabs.first === this.tabs.toArray()[tabNumber];
    const isLast: boolean = this.tabs.last === this.tabs.toArray()[tabNumber];
    const numberOfTabs: number = this.tabs.length;

    if (event.key === 'ArrowRight') {
      const nextIndex: number = isLast ? 0 : tabNumber + 1;
      this.buttons.toArray()[nextIndex].nativeElement.focus();
      this.selectTab(this.tabs.toArray()[nextIndex]);
    }

    if (event.key === 'ArrowLeft') {
      const nextIndex: number = isFirst ? numberOfTabs - 1 : tabNumber - 1;
      this.buttons.toArray()[nextIndex].nativeElement.focus();
      this.selectTab(this.tabs.toArray()[nextIndex]);
    }
  }
}
