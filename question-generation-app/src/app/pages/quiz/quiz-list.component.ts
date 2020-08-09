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

  //Limit the results 
  public pageNumber: number = 0;
  public limit: number = 4;
  public total: number;

  //Search bar
  public loading: boolean;
  public searchTerm = new Subject<string>();
  public searchResults: IQuizList;
  public paginationElements: any;
  public errorMessage: any;

  constructor(private _quizService: QuizService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.getQuizzes(this.pageNumber);
  }

  ngOnInit() {
    this.search();
    this._quizService.listQuizzes(this.pageNumber, this.limit).subscribe((data : IQuizList) => {
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
    ).subscribe((searchResults : IQuizList) => {
      this.loading = false;
      this.quizList = searchResults;
      this.total = searchResults.totalCount;
      console.log("search" + this.quizList);
    })
  }


  //Page change event from pagination div.
  pageChange(pageNo: number){
    this.pageNumber = pageNo;
    this.getQuizzes(this.pageNumber);
  }

  //Update the page number.
  getQuizzes(p: number){
    let page = (p - 1);
    //Retreive quizzes based on page number
    this._quizService.listQuizzes(page, this.limit).subscribe(
      (data : IQuizList) => {
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











