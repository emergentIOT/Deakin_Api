import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IQuizList } from 'src/app/interfaces/IQuizList';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router'; // CLI imports router

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss'], 
})
export class QuizListComponent implements OnInit {
  
  public quizList: Observable<IQuizList>;// = { list: IQuiz[] };

  //search Quiz (ng model)
  searchQuiz;
  //pagination config
  config: any;

  constructor(private _quizService: QuizService, private router: Router, private activatedRoute: ActivatedRoute) {

    //set the config
    this.config = {
      currentPage: 1,
      itemsPerPage : 6,
      totalItems : 0
    }

    activatedRoute.queryParams.subscribe(
      params => this.config.currentPage = params['page'] ? params['page']:1
    )

  }

  ngOnInit() {
    this.quizList = this._quizService.listQuizzes();
  }

  //Pagination change event
  pageChange(newPage: number){
    this.router.navigate([''], {queryParams : {page: newPage}});
   }

  // newQuiz() {
  //   this.router.navigate(["edit-quiz"]);
  //   return false;
  // }

}











