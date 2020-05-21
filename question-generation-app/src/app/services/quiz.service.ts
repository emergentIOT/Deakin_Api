import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IQuizList } from "../interfaces/IQuizList";
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  apiEndpoint = '/qa/';

  private endpoint = 'assets/mock-data/quiz-list.mock.json';


  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  getQuizzes() {
    // const url = this.appConfigService.apiUrl + this.apiEndpoint;
    const url = this.endpoint;
    return this.http.get<IQuizList>(url).pipe(publishReplay(1), refCount());
  }
}
