import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng-mocks';

import { AppComponent } from './app.component';
import { NavComponent } from './shared/ui-components/nav/nav.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/ui-components/footer/footer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from './services/app-config/app-config.service';
import { MockedAppConfigService } from './services/app-config/app-config.service.mock';
import { AppConnectService } from './services/auth/appconnect-oauth.service';
import { MockedAppConnectService } from './services/auth/appconnect-oauth.service.mock';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [
        AppComponent,
        MockComponent(NavComponent),
        MockComponent(RouterOutlet),
        MockComponent(FooterComponent)
      ],
      providers: [
        { provide: AppConfigService, useClass: MockedAppConfigService },
        { provide: AppConnectService, useClass: MockedAppConnectService }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'DeakinSync'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('DeakinSync');
  });

  ['app-nav', 'router-outlet', 'app-footer'].forEach(
    (configuredPageComponent) => {
      it('should be configured with nav, router outlet, footer components in body', () => {
        const fixture = TestBed.createComponent(AppComponent);

        fixture.detectChanges();

        const compiled = fixture.debugElement.query(
          By.css(configuredPageComponent)
        ).name;
        expect(compiled).toContain(configuredPageComponent);
      });
    }
  );

  // TODO: write tests for new functionality
});
