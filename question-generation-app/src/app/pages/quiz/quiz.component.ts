import { Component, OnInit, ViewChild } from '@angular/core';
import { ChipList } from '@syncfusion/ej2-angular-buttons';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { QuizService } from 'src/app/services/quiz.service';
import { IQuizUpdate } from 'src/app/interfaces/iQuizUpdate';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {

  @ViewChild('chipsList') public chipsList: ChipList;
  @ViewChild('textEditor') public textEditor: TextEditorComponent;

  private quizId: string;
  private quiz: IQuiz;
  private name: string;
  private tokens: string[] = [];
  public textValue: string;

  constructor(private quizService : QuizService,
              private route: ActivatedRoute, private router : Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      if (this.quizId) {
        this.quizService.getQuiz(this.quizId).subscribe(
          quiz => {
            this.quiz = quiz
            this.name = quiz.name;
            this.tokens = this.quizService.getAnswerTokens(this.quiz);
            // this.textValue = this.quiz.richText;
            this.textEditor.update(this.tokens, this.quiz.richText);
          }
        );
      }
    });

  }

  get canGenerateQuiz() : boolean {
    if (this.tokens.length === 0) {
      return false;
    }
    if (!this.textEditor.hasPlainText()) {
      return false;
    }
    return this.quizService.calcUnprocessedCount(this.quiz) === 0; 
  }


  newToken(token : string) {
    this.tokens.push(token);
    this.chipsList.refresh();
  }

  deleteToken({text, index}) {
    this.textEditor.deleteToken(text);
  }

  generateQuiz() {
    if (!this.canGenerateQuiz) {
      return;
    }
    let quizUpdate : IQuizUpdate = {
      _id: this.quizId,
      name: this.name,
      plainText: this.textEditor.getPlainText(),
      richText: this.textEditor.getRichText(),
      answerTokens: this.tokens
    }
    this.quizService.saveAndGenerate(quizUpdate).subscribe((result : IQuiz) => {
      this.quizId = result._id;
      console.log('result', result);
    });
  }
}
