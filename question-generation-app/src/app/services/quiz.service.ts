import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IQuizList } from "../interfaces/IQuizList";
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount, catchError, concatMap, map } from 'rxjs/operators';
import { IQuiz } from '../interfaces/iQuiz';
import { handleError } from '../shared/data/util-http';
import { IResponse } from '../interfaces/iResponse';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { IQuizUpdate } from '../interfaces/iQuizUpdate';
import { IQuizToken } from '../interfaces/iQuizToken';
import { isEmpty } from 'npm-stringutils';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private CHECK_FOR_QUIZ_INTERVAL_SECONDS = 3;

  private apiUrlQuizzes = this.appConfigService.apiUrl + '/api/v1/qa/quizzes';
  private apiUrlQuiz = this.appConfigService.apiUrl + '/api/v1/qa/quiz';
  private apiUrlQuizTokens = this.appConfigService.apiUrl + '/api/v1/qa/quiz-tokens';
  private apiUrlGenerateAnswerTokens = this.appConfigService.apiUrl + '/api/v1/qa/generate-answer-tokens';
  private apiUrlQG = this.appConfigService.apiUrl + '/api/v1/qa/generate-questions';
  // private apiUrl = 'assets/mock-data/quiz-list.mock.json';
  private quizUpdateSubject = new Subject<IQuiz>();
  private quizWatchSubscription : Subscription;

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


  getQuizTokens(quizId : string) : Observable<IQuiz> {
    return this.http.get<IResponse<IQuiz>>(`${this.apiUrlQuizTokens}/${quizId}`).pipe(
      map<IResponse<IQuiz>, IQuiz>(res => res.data));
  }

  deleteQuiz(quizId : string) : Observable<void>{
    return this.http.delete<void>(`${this.apiUrlQuiz}/${quizId}`);
  }

  generateAnswerTokens(quizId : string, plainText : string) : Observable<string[]> {
    let body = { quizId, plainText};
    return this.http.put<IResponse<string[]>>(`${this.apiUrlGenerateAnswerTokens}`, body).pipe(
      map<IResponse<string[]>, string[]>(res => res.data));
  }

  saveAndGenerate(quiz : IQuizUpdate) : Observable<IQuiz> {
    return this.http.put<IResponse<string>>(this.apiUrlQuiz, quiz).pipe(
      concatMap((result : IResponse<string>) => {
        if (isEmpty(result.data)) {
          throw new Error("Bad result.");
        }
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

  /**
   * False is none of the tokens have a status, this quiz has
   * not been generated / attempted to be processed yet.
   */
  isProcessingOrHasBeenProcessed(quiz : IQuiz) : boolean {
    if (!quiz || !quiz.tokens || quiz.tokens.length === 0) {
      return false;
    }
    let hasStatus = false;
    quiz.tokens.forEach((token : IQuizToken) => {
      if (!isEmpty(token.status)) {
        hasStatus = true;
      }
    });
    return hasStatus;
  }

  calcUnprocessedCount(quiz : IQuiz) : number {
    let count = 0;
    if (!quiz || !quiz.tokens) {
      return count;
    }
    quiz.tokens.forEach((token : IQuizToken) => {
      if (token.status === "pending" || token.status == "processing") {
        count++;
      }
    })
    return count;
  }

  stopWatchQuizStatus() {
    if (this.quizWatchSubscription) {
      this.quizWatchSubscription.unsubscribe();
      this.quizWatchSubscription = null;
    }
  }
  startWatchQuizStatus(quizId : string) :  Observable<IQuiz> {
    this.stopWatchQuizStatus();

    let observable : Observable<IQuiz> = new Observable(observer => {

      this.quizWatchSubscription = interval(this.CHECK_FOR_QUIZ_INTERVAL_SECONDS * 1000).subscribe(() => {

        this.getQuizTokens(quizId).subscribe( quiz => {
          observer.next(quiz);
          if (this.calcUnprocessedCount(quiz) == 0) {
            this.stopWatchQuizStatus();  
          }
          // this.quizUpdateSubject.next(quiz);
        })

      });
    });
    return observable;
  }
}
