import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { AppConfigService } from './app/services/app-config/app-config.service';
import { APP_CONFIG } from './app/services/app-config/injector';

const configUrl = 'assets/config/app-config.json';

if (environment.production) {
  enableProdMode();
}
(async () => {
  const response = await fetch(configUrl);
  const configObj = await response.json();
  // https://medium.com/better-programming/follow-up-how-to-handle-async-providers-in-angular-54957c7349c4
  platformBrowserDynamic([{ provide: APP_CONFIG, useValue: configObj }])
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
})();
