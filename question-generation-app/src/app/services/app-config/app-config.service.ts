import { Injectable, Inject } from '@angular/core';
import {
  IAppConfig,
  IAuthConfig,
  IJsBundlesConfig
} from '../../interfaces/iAppConfig';
import { environment } from 'src/environments/environment';
import { APP_CONFIG } from './injector';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  public configUrl = 'assets/config/app-config.json';

  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {}

  public get jsBundles(): IJsBundlesConfig {
    return this.config.jsBundles;
  }

  public get apiUrl(): string {
    return this.config.apiUrl;
  }

  public get authConfig(): IAuthConfig {
    return this.config.authConfig;
  }
}
