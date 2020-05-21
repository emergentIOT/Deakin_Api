import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IQuizList } from 'src/app/interfaces/IQuizList';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { QuizService } from 'src/app/services/quiz.service';
import { Router } from '@angular/router'; // CLI imports router

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  
  private quizList: Observable<IQuizList>;// = { list: IQuiz[] };

  constructor(private _quizService: QuizService, private router: Router) {}

  ngOnInit() {
    this.quizList = this._quizService.getQuizzes();
  }

  newQuiz() {
    this.router.navigate(["edit-quiz"]);
    return false;
  }
}











