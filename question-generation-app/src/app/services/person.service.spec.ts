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

});
