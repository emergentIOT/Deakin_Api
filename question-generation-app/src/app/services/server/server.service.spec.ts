import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { TestBed } from '@angular/core/testing';
import { MockedAppConfigService } from '../app-config/app-config.service.mock';
import { AppConfigService } from '../app-config/app-config.service';

/* tslint:disable:max-classes-per-file */
class TestModel {
  id: number;
  name: string;
}

@Injectable()
class TestBaseDataService extends ServerService<TestModel> {
  constructor(http: HttpClient, appConfig: MockedAppConfigService) {
    super('/test/', http, appConfig as AppConfigService);
  }
}

describe('BaseDataService', () => {
  let service: TestBaseDataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestBaseDataService, MockedAppConfigService]
    });
    service = TestBed.get(TestBaseDataService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  const testModel: TestModel = { id: 1, name: 'Jeff' };

  it('should perform a GET request and get response', (done) => {
    const result$ = service.get();

    result$.subscribe((result) => {
      console.log(result);
      expect(result).toEqual(result);
      done();
    });

    const request = expectApiRequestOfType(
      `${MockedAppConfigService.config.apiUrl}/test/`,
      'GET'
    );
    request.flush(testModel);
  });

  it('should perform a POST request and get response', (done) => {
    const result$ = service.post(testModel);

    result$.subscribe((result) => {
      expect(result).toEqual({ success: true });
      done();
    });

    const request = expectApiRequestOfType(
      `${MockedAppConfigService.config.apiUrl}/test/`,
      'POST',
      testModel
    );
    request.flush({ success: true });
  });

  afterEach(() => {
    // After every test, assert that there are no pending requests.
    httpTestingController.verify();
  });

  const expectApiRequestOfType = (path, method, body = null) => {
    const testRequest = httpTestingController.expectOne(`${path}`);
    const { request } = testRequest;

    expect(request.method).toEqual(method);
    expect(request.body).toEqual(body);
    return testRequest;
  };
});
