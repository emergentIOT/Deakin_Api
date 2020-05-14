import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tab-panel',
  templateUrl: './tab-panel.component.html',
  styleUrls: ['./tab-panel.component.scss']
})
export class TabPanelComponent implements OnInit {

  @Input()
  title: string;

  @Input()
  active = false;

  constructor() { }

  safeTitleForAttributes(): string {
    // Use a regex to match any non-alphanumeric character
    const regex = /[^a-zA-Z0-9]/;

    // Remove any matched characters and replace upper case with lower case
    return this.title.replace(regex, '').toLowerCase();
  }

  ngOnInit() {
  }

}
