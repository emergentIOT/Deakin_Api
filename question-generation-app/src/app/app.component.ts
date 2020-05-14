import { Component, OnInit } from '@angular/core';
import { AppConfigService } from './services/app-config/app-config.service';
import { AppConnectService } from './services/auth/appconnect-oauth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private appConfigService: AppConfigService,
    private authService: AppConnectService
  ) {
    this.authService.initializeOAuth().subscribe({
      error(e) {
        // Fatal error encountered when initializing OAuth. App needs to handle this
        console.error(`Error encountered when initializing OAuth`, e);
        console.info('The identity provider may not be avilable or configured properly.');
      }
    });
  }

  title = 'AI Quiz Generation';

  ngOnInit() {
    /**
     * Get the config object for web component libraries and use it to set the src
     * attributes of the relevent script tags in the head. The values in the
     * config object are modified by the build pipeline.
     * See app/src/assets/config/README.md on how this works
     */
    const setScriptAttrs = (data) => {
      Object.keys(data).forEach((key) => {
        const ref = document.getElementById(key);
        if (ref) {
          ref.setAttribute('src', `${data[key].rootUrl}/${data[key].path}`);
        }
      });
    };

    setScriptAttrs(this.appConfigService.jsBundles);
  }
}
