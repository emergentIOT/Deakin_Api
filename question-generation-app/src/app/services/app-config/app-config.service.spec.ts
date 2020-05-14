import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { AppConfigService } from './app-config.service';
import { IAppConfig } from '../../interfaces/iAppConfig';
import { MockedAppConfigService } from './app-config.service.mock';
import { APP_CONFIG } from './injector';

const configObject: IAppConfig = MockedAppConfigService.config;

describe('AppConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: configObject }]
    });
  });

  it('should be created', () => {
    const service: AppConfigService = TestBed.get(AppConfigService);

    expect(service).toBeTruthy();
  });

  it('should return config items', (done) => {
    const service: AppConfigService = TestBed.get(AppConfigService);

    expect(service.apiUrl).toEqual(configObject.apiUrl);
    expect(service.authConfig).toEqual(configObject.authConfig);
    expect(service.jsBundles).toEqual(configObject.jsBundles);
    done();
  });
});
