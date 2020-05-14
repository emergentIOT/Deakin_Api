import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IQuizData } from '../interfaces/iQuizData';
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  apiEndpoint = '/qa/';

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  getQuizs() {
    const url = this.appConfigService.apiUrl + this.apiEndpoint;
    return this.http.get<IQuizData>(url).pipe(publishReplay(1), refCount());
  }
}
