import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IQuizList } from "../interfaces/IQuizList";
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount, catchError, concatMap, map } from 'rxjs/operators';
import { IQuiz } from '../interfaces/iQuiz';
import { handleError } from '../shared/data/util-http';
import { IQuizResponse } from '../interfaces/iQuizResponse';
import { Observable } from 'rxjs';
import { IQuizUpdate } from '../interfaces/iQuizUpdate';
import { IResponse } from '../interfaces/iResponse';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrlQuiz = this.appConfigService.apiUrl + '/api/v1/qa/quiz';
  private apiUrlQG = this.appConfigService.apiUrl + '/api/v1/qa/generate-questions';
  // private apiUrl = 'assets/mock-data/quiz-list.mock.json';


  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  getQuizzes() {
    return this.http.get<IQuizList>(this.apiUrlQuiz).pipe(publishReplay(1), refCount());
  }


  saveAndGenerate(quiz : IQuizUpdate) : Observable<IQuiz> {
    return this.http.put<IResponse<string>>(this.apiUrlQuiz, quiz).pipe(
      concatMap((result : IResponse<string>) => {
          return this.http.put<IResponse<string>>(`${this.apiUrlQG}/${result.data}`, {});
      }), 
      concatMap((result : IResponse<string>) => {
        return this.http.get<IResponse<IQuiz>>(`${this.apiUrlQuiz}/${result.data}`).pipe(
          map<IResponse<IQuiz>, IQuiz>( result => result.data)
        );
      })
    );
  }
}
