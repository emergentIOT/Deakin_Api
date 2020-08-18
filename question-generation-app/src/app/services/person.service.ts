import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPerson } from '../interfaces/iPerson';
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount } from 'rxjs/operators';
import { StateService } from './state.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  apiEndpoint = '/users/';

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private stateObject: StateService
  ) {}

  getPerson() : Observable<IPerson> {

    return this.http.get<IPerson>('assets/mock-data/person.mock.json')
              .pipe(publishReplay(1), refCount());
    // const url =
    //   this.appConfigService.apiUrl +
    //   this.apiEndpoint +
    //   this.stateObject.getValue('username');
    // return this.http.get<IPerson>(url).pipe(publishReplay(1), refCount());
  }
}
