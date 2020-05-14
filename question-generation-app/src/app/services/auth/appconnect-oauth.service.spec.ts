import { TestBed } from '@angular/core/testing';
import { AppConnectService } from './appconnect-oauth.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { MockedAppConfigService } from '../app-config/app-config.service.mock';
import { AppConfigService } from '../app-config/app-config.service';
import { Observable } from 'rxjs';

describe('AppConnect OAuth Service', () => {
  let mockedAppConfigService: MockedAppConfigService;
  let appConnectService: AppConnectService;
  let mockOAuthService: OAuthService;

  const stubOAuthService = {
    configure: () => {},
    loadDiscoveryDocumentAndTryLogin: () =>
      new Promise((res, rej) => res(true)),
    tokenValidationHandler: '',
    setupAutomaticSilentRefresh: () => {},
    silentRefresh: () => new Promise((res, rej) => res(true)),
    events: new Observable<any>((o) => o.complete()),
    hasValidAccessToken: () => true
  };

  beforeEach(() => {
    spyOn(stubOAuthService, 'configure');
    spyOn(stubOAuthService, 'setupAutomaticSilentRefresh');
    spyOn(
      stubOAuthService,
      'loadDiscoveryDocumentAndTryLogin'
    ).and.callThrough();

    TestBed.configureTestingModule({
      providers: [
        { provide: OAuthService, useValue: stubOAuthService },
        { provide: AppConfigService, useClass: MockedAppConfigService }
      ]
    });

    mockedAppConfigService = TestBed.get(AppConfigService);
    appConnectService = TestBed.get(AppConnectService);
    mockOAuthService = TestBed.get(OAuthService);
  });

  it('Constructor calls configure and setup automatic silent refresh', () => {
    expect(appConnectService).toBeTruthy();
    expect(mockOAuthService.configure).toHaveBeenCalledWith({
      ...mockedAppConfigService.authConfig,
      redirectUri: window.location.origin + '/login'
    });
    expect(mockOAuthService.setupAutomaticSilentRefresh).toHaveBeenCalled();
  });

  it('Initialize OAuth on has valid access token', (done) => {
    appConnectService.initializeOAuth().subscribe(
      // In this case observable has to complete successfully
      (x) => {},
      (e) => {},
      () => {
        expect(
          mockOAuthService.loadDiscoveryDocumentAndTryLogin
        ).toHaveBeenCalled();
        done();
      }
    );
  });

  it('Initialize OAuth on no valid access token but successful silent refresh', (done) => {
    spyOn(mockOAuthService, 'hasValidAccessToken').and.returnValue(false);
    appConnectService.initializeOAuth().subscribe(
      // In this case observable has to complete successfully
      (x) => {},
      (e) => {},
      () => {
        expect(
          mockOAuthService.loadDiscoveryDocumentAndTryLogin
        ).toHaveBeenCalled();
        expect(mockOAuthService.hasValidAccessToken).toHaveBeenCalled();
        done();
      }
    );
  });

  it('Initialize OAuth on unsuccessful login and unknown error', (done) => {
    spyOn(mockOAuthService, 'hasValidAccessToken').and.returnValue(false);
    spyOn(mockOAuthService, 'silentRefresh').and.returnValue(
      new Promise((res, rej) => rej({}))
    ); // simulating a rejection

    appConnectService.initializeOAuth().subscribe(
      // In this case observable has to  throw error successfully
      (x) => {},
      (e) => {
        // Observable errors with payload {}
        expect(
          mockOAuthService.loadDiscoveryDocumentAndTryLogin
        ).toHaveBeenCalled();
        expect(mockOAuthService.hasValidAccessToken).toHaveBeenCalled();
        expect(mockOAuthService.silentRefresh).toHaveBeenCalled();
        expect(e).toEqual({});
        done();
      },
      () => {}
    );
  });

  it('Initialize OAuth on unsuccessful login and login required', (done) => {
    const loginRequiredError = {
      reason: {
        error: 'login_required'
      }
    };
    spyOn(mockOAuthService, 'hasValidAccessToken').and.returnValue(false);
    spyOn(mockOAuthService, 'silentRefresh').and.returnValue(
      new Promise((res, rej) => rej(loginRequiredError))
    ); // simulating a rejection

    appConnectService.initializeOAuth().subscribe(
      // In this case observable has to  throw error successfully
      (x) => {},
      (e) => {},
      () => {
        // Observable completes
        expect(
          mockOAuthService.loadDiscoveryDocumentAndTryLogin
        ).toHaveBeenCalled();
        expect(mockOAuthService.hasValidAccessToken).toHaveBeenCalled();
        expect(mockOAuthService.silentRefresh).toHaveBeenCalled();

        done();
      }
    );
  });
});
