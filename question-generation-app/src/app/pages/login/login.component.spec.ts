import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AppConnectService } from 'src/app/services/auth/appconnect-oauth.service';
import { MockedAppConnectService } from 'src/app/services/auth/appconnect-oauth.service.mock';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockedAppConnectService: MockedAppConnectService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AppConnectService, useClass: MockedAppConnectService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockedAppConnectService = TestBed.get(AppConnectService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show access token ', () => {
    expect(component.accessToken).toEqual('ACCESS_TOKEN');
  });

  // Logged out cases

  it('should show message with mock user logged in', () => {
    // spying on a function to force return false
    spyOn(mockedAppConnectService, 'hasValidAccessToken').and.returnValue(
      false
    );

    expect(component.accessToken).toEqual('No Access Token Found');
  });
});
