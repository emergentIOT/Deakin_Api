import { Component, OnInit } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
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

  //Limit the results 
  public pageNumber: number = 1;
  public limit: number = 6;
  public total: number;
  public hidePagination: boolean = true;
  private LIMIT_FOR_HIDE_PAGINATION = 6;
  private SEARCH_PAGE_NUMBER = 0;
  //Search bar
  public loading: boolean;
  public searchTerm = new Subject<string>();
  public searchResults: IQuizList;
  public errorMessage: any;

  constructor(private _quizService: QuizService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.search();
    this.loading = true;
    this._quizService.listQuizzes(this.pageNumber, this.limit).subscribe((data : IQuizList) => {
      this.loading = false;
      this.quizList = data;
      this.total = data.totalCount;
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
        return this._quizService.listQuizzes(1, this.limit, searchInput);
      })
    ).subscribe((searchResults : IQuizList) => {
      this.loading = false;
      this.quizList = searchResults;
      this.total = searchResults.totalCount;
      if(this.total < this.LIMIT_FOR_HIDE_PAGINATION){
        this.hidePagination = false;
      }
      else {
        this.hidePagination = true;
      }
     })
  }


  //Page change event from pagination div.
  pageChange(pageNo: number){
    this.pageNumber = pageNo;
    this.getQuizzes(this.pageNumber);
  }

  //Update the page number.
  getQuizzes(p: number){
    
    this.loading = true;
    this._quizService.listQuizzes(p, this.limit).subscribe(
      (data : IQuizList) => {
        this.loading = false;
        this.total = data.totalCount;
        this.quizList = data;
      }
    )
  }


 

  // newQuiz() {
  //   this.router.navigate(["edit-quiz"]);
  //   return false;
  // }

}











