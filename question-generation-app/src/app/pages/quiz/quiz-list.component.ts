import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IQuizList } from 'src/app/interfaces/IQuizList';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router'; // CLI imports router
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { publishReplay, refCount, catchError, concatMap, map, debounce, distinctUntilChanged, switchMap, debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss'], 
})
export class QuizListComponent implements OnInit {
  
  public quizList: IQuizList;// = { list: IQuiz[] };

  //New Mongo changes 
  public p: number = 0;
  public limit: number = 4;
  public total: number;

  //Search bar
  public loading: boolean;
  public searchTerm = new Subject<string>();
  public searchResults: IQuizList;
  public paginationElements: any;
  public errorMessage: any;

  constructor(private _quizService: QuizService, private router: Router, private activatedRoute: ActivatedRoute) {
   
  }

  ngOnInit() {
    this.search();
    this._quizService.listQuizzes(this.p, this.limit).subscribe((data : IQuizList) => {
      this.quizList = data;
      console.log("ng on init" + this.quizList);
    });
  }

  
  //Search form
  public searchForm = new FormGroup({
    search: new FormControl("", Validators.required),
  });

  //Search quizzes
  public search(){
    this.searchTerm.pipe(
      map((e: any) => {
        console.log(e.target.value);
        return e.target.value;
      }), 
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(searchInput => {
        this.loading = true;

        return this._quizService.listQuizzes(0, this.limit, searchInput);
      })
    ).subscribe(searchResults => {
      this.loading = false;
      this.quizList = searchResults;
      this.total = searchResults.totalCount;
     // this.paginationElements = this.quizList;
      console.log("search" + this.quizList);
    })
  }


 

  // newQuiz() {
  //   this.router.navigate(["edit-quiz"]);
  //   return false;
  // }

}











