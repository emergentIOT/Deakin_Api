import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IQuizList } from "../interfaces/IQuizList";
import { AppConfigService } from './app-config/app-config.service';
import { publishReplay, refCount, catchError, switchMap } from 'rxjs/operators';
import { IQuiz } from '../interfaces/iQuiz';
import { handleError } from '../shared/data/util-http';
import { IQuizResponse } from '../interfaces/iQuizResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrlText = this.appConfigService.apiUrl + '/api/v1/qa/text';
  private apiUrlQG = this.appConfigService.apiUrl + '/api/v1/qa/generate-questions';
  // private apiUrl = 'assets/mock-data/quiz-list.mock.json';


  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  getQuizzes() {
    return this.http.get<IQuizList>(this.apiUrlText).pipe(publishReplay(1), refCount());
  }


  saveAndGenerate(quiz) : Observable<IQuizResponse> {
    // return this.http.put(this.apiUrlText, quiz).pipe(
    //   switchMap((data : IQuizResponse) => {
    //     let resourceId = data.resourceId;
    //     console.log(data);
    //     return this.http.get(`${this.apiUrlQG}/${resourceId}?answerToken=${quiz.tokens[0]}`)

    //   })
    // );
  }
}
