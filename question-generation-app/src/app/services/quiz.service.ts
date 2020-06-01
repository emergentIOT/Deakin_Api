import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IQuizList } from "../interfaces/IQuizList";
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount, catchError, concatMap, map } from 'rxjs/operators';
import { IQuiz } from '../interfaces/iQuiz';
import { handleError } from '../shared/data/util-http';
import { IResponse } from '../interfaces/iResponse';
import { Observable } from 'rxjs';
import { IQuizUpdate } from '../interfaces/iQuizUpdate';
import { IQuizToken } from '../interfaces/iQuizToken';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private apiUrlQuizzes = this.appConfigService.apiUrl + '/api/v1/qa/quizzes';
  private apiUrlQuiz = this.appConfigService.apiUrl + '/api/v1/qa/quiz';
  private apiUrlQG = this.appConfigService.apiUrl + '/api/v1/qa/generate-questions';
  // private apiUrl = 'assets/mock-data/quiz-list.mock.json';


  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  listQuizzes() : Observable<IQuizList> {
    return this.http.get<IQuizList>(this.apiUrlQuizzes).pipe(publishReplay(1), refCount());
  }

  getQuiz(quizId : string) : Observable<IQuiz> {
    return this.http.get<IResponse<IQuiz>>(`${this.apiUrlQuiz}/${quizId}`).pipe(
      map<IResponse<IQuiz>, IQuiz>(res => res.data));
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

  getAnswerTokens(quiz : IQuiz) : string[] {
    let tokens : string[] = [];
    if (quiz && quiz.tokens) {
      quiz.tokens.forEach((token : IQuizToken) => 
          tokens.push(token.answerToken));
    }
    return tokens;
  }

  calcUnprocessedCount(quiz : IQuiz) : number {
    let count = 0;
    if (!quiz || !quiz.tokens) {
      return count;
    }
    quiz.tokens.forEach((token : IQuizToken) => {
      if (token.status !== "processed") {
        count++;
      }
    })
    return count;
  }
}
