import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { PersonService } from './person.service';
import { IPerson } from '../interfaces/iPerson';
import { AppConfigService } from './app-config/app-config.service';
import { MockedAppConfigService } from './app-config/app-config.service.mock';

describe('PersonService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AppConfigService, useClass: MockedAppConfigService }
      ]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: PersonService = TestBed.get(PersonService);
    expect(service).toBeTruthy();
  });

  it('can GET data', () => {
    const testData: IPerson = {
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
          dateCommenced: '30-01-2018',
          dateCompleted: '20-05-2019',
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
          dateCommenced: '30-07-2018',
          dateCompleted: '',
          creditPointsRequired: 32,
          creditPointsForPriorLearning: 4,
          creditPointsAwarded: 18,
          creditPointsActive: 4
        }
      ]
    };
    httpClient
      .get<IPerson>('./person.service.mock.json')
      .subscribe((data) => expect(data).toEqual(testData));
  });
});
