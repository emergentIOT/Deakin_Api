import { AppConnectService } from './appconnect-oauth.service';
import { Observable, observable } from 'rxjs';

/**
 * All consumers of AppConnectService can use this mock class
 * in order to inject it to the component being tested.
 * The functions in the class are configured to return positive
 * value. This behavior can be configured in tests by using
 * jasmine's spyOn method ex.
 *
 *    spyOn(someObj, 'getAccessToken').and.returnValue(null);
 *
 * See https://jasmine.github.io/api/edge/Spy.html
 */
export class MockedAppConnectService {
  public initializeOAuth(): Observable<boolean> {
    return new Observable((o) => {
      o.complete();
    });
  }
  public initLoginFlow = () => {};

  public logOut = () => {};

  public refresh = () => {};

  public hasValidAccessToken = () => true;

  public getAccessToken = () => {
    return 'ACCESS_TOKEN';
  };
}
