import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { WelcomePanelComponent } from './welcome-panel.component';
import { Student } from '../../../classes/student';
import { IPerson } from '../../../interfaces/iPerson';
import { CopyToClipboardComponent } from '../../../shared/ui-components/copy-to-clipboard/copy-to-clipboard.component';

describe('WelcomePanelComponent', () => {
  let component: WelcomePanelComponent;
  let fixture: ComponentFixture<WelcomePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WelcomePanelComponent,
        MockComponent(CopyToClipboardComponent)
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomePanelComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });
});
