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

  it('should create', () => {
    component = fixture.componentInstance;
    component.person = {
      accountType: 'Student',
      cohort: 'student',
      id: 9999999998,
      username: 'tedeaki',
      title: 'Miss',
      givenNames: 'Tedeaki',
      lastName: 'TestLast',
      preferredName: 'Test',
      position: '',
      facultyArea: '',
      homeCampus: {
        code: 'F',
        name: 'Geelong Waterfront Campus'
      },
      image: 'some_image',
      courseDetails: [
        {
          code: 'M722',
          shortName: 'MASTER ICT',
          name: 'MASTER OF INFORMATION AND COMMUNICATION TECHNOLOGY',
          status: 'COMPLETED',
          url:
            'https://www.deakin.edu.au/current-students-courses/course.php?course=S334&year=2020',
          dateCommenced: '30-01-2017',
          dateCompleted: '20-09-2018',
          creditPointsRequired: 12,
          creditPointsForPriorLearning: null,
          creditPointsAwarded: 12,
          creditPointsActive: null
        },
        {
          code: 'S778',
          shortName: 'BACH ICA',
          name: 'BACHELORS OF INFORMATION AND COMMUNICATION ACRONYMS',
          status: 'ENROLLED',
          url:
            'https://www.deakin.edu.au/current-students-courses/course.php?course=S778&year=2020',
          dateCommenced: '30-01-2019',
          dateCompleted: '',
          creditPointsRequired: 32,
          creditPointsForPriorLearning: 4,
          creditPointsAwarded: 18,
          creditPointsActive: 4
        }
      ]
    };

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
