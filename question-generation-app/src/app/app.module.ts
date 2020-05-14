import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { NavComponent } from './shared/ui-components/nav/nav.component';
import { FooterComponent } from './shared/ui-components/footer/footer.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { FeatureCardService } from './services/feature-card.service';
import { PersonService } from './services/person.service';
import { AppRoutingModule } from './app-routing.module';
import { StateService } from './services/state.service';
import { AppConnectService } from './services/auth/appconnect-oauth.service';

@NgModule({
  declarations: [AppComponent, NavComponent, FooterComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    OAuthModule.forRoot({
      resourceServer: {
        sendAccessToken: true
      }
    })
  ],
  // providers: [] are removed from NgModule as the preferred new way
  // to register singleton services is to use providedIn: 'root'
  // https://dev.to/christiankohler/improved-dependeny-injection-with-the-new-providedin-scopes-any-and-platform-30bb
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
