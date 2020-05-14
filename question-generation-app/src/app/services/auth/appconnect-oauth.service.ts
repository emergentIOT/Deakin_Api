import {
  OAuthService,
  OAuthErrorEvent
} from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { AppConfigService } from '../app-config/app-config.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConnectService {
  pathToConfigJson = 'assets/config/appConnect.json';

  constructor(
    private oAuthService: OAuthService,
    private appConfigService: AppConfigService
  ) {
    const authConfig = {
      issuer: this.appConfigService.authConfig.issuer,
      redirectUri: window.location.origin + '/login',
      clientId: this.appConfigService.authConfig.clientId,
      scope: this.appConfigService.authConfig.scope,
      requireHttps: this.appConfigService.authConfig.requireHttps,
      requestAccessToken: this.appConfigService.authConfig.requestAccessToken
    };

    this.oAuthService.events.subscribe((event) => {
      if (event instanceof OAuthErrorEvent) {
        console.warn(`OAuth Error Event received`);
      }
    });

    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.tokenValidationHandler = new JwksValidationHandler();
  }

  /**
   * Used to establish the connection to the OAuth identity server
   * has to be called once towards the beginning of app load
   */
  public initializeOAuth(): Observable<boolean> {
    if (location.hash) {
      // If current URL contains location hash, parse it and print it in console for debugging
      // This typically means, the user was just redirected to the application after login
      console.table(
        location.hash
          .substr(1)
          .split('&')
          .map((kvp) => kvp.split('='))
      );
    }

    return new Observable((observer) => {
      this.oAuthService
        .loadDiscoveryDocumentAndTryLogin()
        .then(() => {
          if (this.oAuthService.hasValidAccessToken()) {
            return observer.complete();
          }

          // 2. SILENT LOGIN
          this.oAuthService
            .silentRefresh()
            .then(() => {
              return observer.complete();
            })
            .catch((error) => {
              const errorResponsesRequiringUserIteraction = [
                'interaction_required',
                'login_required',
                'account_selection_required',
                'consent_required'
              ];

              if (
                error &&
                error.reason &&
                errorResponsesRequiringUserIteraction.indexOf(
                  error.reason.error
                ) >= 0
              ) {
                // 3. User yet to login
                return observer.complete();
              }
              observer.error(error);
            });
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Redirects user to the identity provider to initiate login process
   */
  public initLoginFlow = () => this.oAuthService.initLoginFlow();
  public logOut = () => this.oAuthService.logOut();
  public refresh = () => this.oAuthService.silentRefresh();

  public hasValidAccessToken = () => this.oAuthService.hasValidAccessToken();
  public getAccessToken = () => this.oAuthService.getAccessToken();
}
