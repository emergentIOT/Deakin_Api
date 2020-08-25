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
  private SEARCH_PAGE_NUMBER : number = 1;
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
    this.getQuizzes(this.pageNumber, this.limit);
  }

  
  //Search form
  public searchForm = new FormGroup({
    search: new FormControl("", Validators.required),
  });

  //Search stream
  public search(){
    this.searchTerm.pipe(
      map((e: any) => {
        console.log(e.target.value);
        return e.target.value;
      }), 
      debounceTime(400),
      distinctUntilChanged(),  
    ).subscribe(searchInput => {
      this.getQuizzes(this.SEARCH_PAGE_NUMBER, this.limit, searchInput);
    })
  }


  //Page change event from pagination div.
  pageChange(pageNo: number){
    this.pageNumber = pageNo;
    this.getQuizzes(this.pageNumber, this.limit);
  }

  //Subscribe to Quizzes
  getQuizzes(page: number, limit: number, searchInput?: string){
    
    this.loading = true;
    this._quizService.listQuizzes(page, limit, searchInput).subscribe(
      (data : IQuizList) => {
        this.loading = false;
        this.quizList = data;
        this.total = data.totalCount;
        this.pageNumber = data.page;
        if(this.total < this.LIMIT_FOR_HIDE_PAGINATION){
          this.hidePagination = false;
        }
        else {
          this.hidePagination = true;
        }
      }
    )
  }


 

  // newQuiz() {
  //   this.router.navigate(["edit-quiz"]);
  //   return false;
  // }

}











