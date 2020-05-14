export interface IAppConfig {
  jsBundles: { [key: string]: IUrlAndPath };
  apiUrl: string;
  authConfig: IAuthConfig;
}

export interface IJsBundlesConfig {
  [key: string]: IUrlAndPath;
}

export interface IAuthConfig {
  issuer: string;
  clientId: string;
  scope: string;
  requestAccessToken: boolean;
  requireHttps: boolean | 'remoteOnly';
}

interface IUrlAndPath {
  rootUrl: string;
  path: string;
}
