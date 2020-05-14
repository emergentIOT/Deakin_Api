import {
  IAppConfig,
  IAuthConfig,
  IJsBundlesConfig
} from '../../interfaces/iAppConfig';

export class MockedAppConfigService {
  public static config: IAppConfig = {
    apiUrl: 'http://totally-a-real-url/api/v1',
    authConfig: {
      issuer: 'http://oauth-issuer',
      clientId: 'syncv2',
      scope: 'openid',
      requestAccessToken: true,
      requireHttps: false
    },
    jsBundles: {
      test: {
        rootUrl: 'http://totally-a-real-url',
        path: '/totally-a-real-path'
      }
    }
  };

  public get jsBundles(): IJsBundlesConfig {
    return MockedAppConfigService.config.jsBundles;
  }

  public get apiUrl(): string {
    return MockedAppConfigService.config.apiUrl;
  }

  public get authConfig(): IAuthConfig {
    return MockedAppConfigService.config.authConfig;
  }
}
