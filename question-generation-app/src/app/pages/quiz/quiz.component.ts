import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ChipList, ChipModel } from '@syncfusion/ej2-angular-buttons';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { IQuiz } from 'src/app/interfaces/iQuiz';
import { QuizService } from 'src/app/services/quiz.service';
import { IQuizUpdate } from 'src/app/interfaces/iQuizUpdate';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IQuizToken } from 'src/app/interfaces/iQuizToken';
import { isEmpty } from 'npm-stringutils';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {

  @ViewChild('chipsList') public chipsList: ChipList;
  @ViewChild('textEditor') public textEditor: TextEditorComponent;

  private ENABLE_QUIZ_STATUS_CHECK = true;

  private quizId: string;
  private quiz: IQuiz;
  private name: string;
  private tokens: string[] = [];
  public textValue: string;
  private activeTab = 0;
  private watchQuizStatusSubscription : Subscription;

  constructor(private quizService : QuizService,
              private route: ActivatedRoute, private router : Router, 
              private location : Location) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      console.log('ngOnInit', this.quizId);
      if (this.quizId) {
        this.quizService.getQuiz(this.quizId).subscribe(
          quiz => {
            this.quiz = quiz
            this.name = quiz.name;
            this.tokens = this.quizService.getAnswerTokens(this.quiz);
            this.textValue = this.textEditor.selectTokens(this.tokens, this.quiz.richText);
            if (!this.canGenerateQuiz) {
              this.activeTab = 1;
              this.startWatchQuizStatus();
            }
          }
        );
      }
    });
  }

  ngOnDestroy() {
    this.stopWatchQuizStatus();
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

  // get chipTokens() : ChipModel[] {
  //   let chipTokens : ChipModel[] = [];
  //   if (!this.tokens && this.tokens.length === 0) {
  //     return chipTokens;
  //   } 
  //   for (let token of this.tokens) {
  //     chipTokens.push({text : token, leadingIconCss: 'spinner',avatarText: "ddd"});
  //   }
  //   return chipTokens;
  // }

  tabChanged(selectedTabIndex) {
    this.activeTab = selectedTabIndex;
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
      console.log('result', result);
      this.quizId = result._id;
      this.quiz = result;
      this.activeTab = 1;
      this.startWatchQuizStatus();
      // update the url
      this.location.go(`/edit-quiz/${this.quizId}`);
    });
  }

  startWatchQuizStatus() {
    if (!this.ENABLE_QUIZ_STATUS_CHECK || this.watchQuizStatusSubscription) {
      return; // already watching, or turned of for debug purposes
    }
    this.watchQuizStatusSubscription = this.quizService.startWatchQuizStatus(this.quizId).subscribe(quiz => {
      this.quiz.tokens = quiz.tokens;
    });
  }

  stopWatchQuizStatus() {
    if (this.watchQuizStatusSubscription) {
      this.watchQuizStatusSubscription.unsubscribe();
    }
    this.quizService.stopWatchQuizStatus();
  }

  getAnswerText(token : IQuizToken) : string {
    let name = token.answerToken;
    if (isEmpty(name)) {
      return name;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getQuestionText(token : IQuizToken) : string {
    if (isEmpty(token.questionToken)) {
      if (token.status == 'pending') {
        return 'Question generation queued...'
      }
      if (token.status == 'processing') {
        return 'Processing question generation...'
      }
      if (token.status == 'processed') {
        return 'Could not generate question...'
      }
    } 
    return token.questionToken;
  }

  getQuestionTitle(token : IQuizToken) : string {
    if (isEmpty(token.questionToken)) {
      return `Qustion generation [${token.status}]`;
    }
    return token.questionToken;
  }

  isProcessing(token : IQuizToken) {
    return token.status != 'processed';
  }

  isError(token : IQuizToken) {
    return isEmpty(token.questionToken) && token.status == 'processed';
  }
}
