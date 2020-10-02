import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { IQuizToken } from 'src/app/interfaces/iQuizToken';
import { isEmpty } from 'npm-stringutils';

@Component({
  selector: 'app-multiple-choice',
  templateUrl: './multiple-choice.component.html',
  styleUrls: ['./multiple-choice.component.scss']
})
export class MultipleChoiceComponent implements OnInit {

  mode = 'editQuestion';
  quiz: IQuiz;
  public activeTab = 0;
  public quizId: string;
  public tokens: string[] = [];
  questions: IQuizToken[];
  public loading: Boolean;


  constructor(private quizService: QuizService,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit(): void {
  
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      if(this.quizId){
        this.quizService.getQuiz(this.quizId).subscribe(quiz => {
          
          this.quiz = quiz;
          this.tokens = this.quizService.getAnswerTokens(this.quiz);
         
        })
   
      }
    })
    
    this.mode = 'editQuestion';
  }


  getAnswerText(token : IQuizToken) : string {
    let name = token.answerToken;
    if (isEmpty(name)) {
      return name;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  addOption(qIndex: number) {
    const newOption = { name: "" };
    this.quiz.tokens[qIndex].options.push(newOption);
  }

  removeOption(answers: any[], aIndex) {
    if (aIndex > -1) {
      answers.splice(aIndex, 1);
    }
  }

  //saveQuiz With Options
  saveOptions() {

    this.loading = true;
    this.quizService.save(this.quiz).subscribe(data => 
      { 
        this.loading = false;
        this.router.navigate(['/edit-quiz/', this.quizId]);  
      });
  }

}
