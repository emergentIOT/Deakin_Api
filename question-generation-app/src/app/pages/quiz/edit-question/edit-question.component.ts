import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { IQuizToken } from 'src/app/interfaces/iQuizToken';
import { isEmpty } from 'npm-stringutils';
import { iOption } from 'src/app/interfaces/iOption';

@Component({
  selector: 'app-edit-question',
  templateUrl: './edit-question.component.html',
  styleUrls: ['./edit-question.component.scss']
})
export class EditQuestionComponent implements OnInit {
   
  mode = 'editQuestion';
  quiz: IQuiz;
  public activeTab = 0;
  public quizId: string;
  public answerTokens: IQuizToken[];
  questions: IQuizToken[] = [];
  public loading: Boolean;
  newOption : iOption;
  i = 0;
  constructor(private quizService: QuizService,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit(): void {
  
   
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      if (this.quizId){
        this.quizService.getQuiz(this.quizId).subscribe(quiz => {
          
          this.quiz = quiz;
          //Adding each answerToken for options.
          this.quiz.tokens.forEach(item => {
            if (this.quiz.tokens[this.i].options.length == 0){
              this.newOption = { name: "", chosenFeedback: "", notChosenFeedback: "" };
              this.newOption.name = item.answerToken;
              this.quiz.tokens[this.i].options.push(this.newOption);
            }
          this.i++;
        })
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
    this.newOption = { name: "", chosenFeedback: "", notChosenFeedback: "" };
    this.quiz.tokens[qIndex].options.push(this.newOption);
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
