import { InjectionToken } from '@angular/core';
import { IAppConfig } from 'src/app/interfaces/iAppConfig';

export const APP_CONFIG = new InjectionToken<IAppConfig>('App Config');
