import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QuizComponent } from './quiz.component';
import { EditQuestionComponent } from './edit-question/edit-question.component';

const routes: Routes = [
  { path: 'edit-quiz/:quizId', component: QuizComponent }, 
  { path: 'edit-quiz', component: QuizComponent },
  { path: 'edit-question/:quizId', component: EditQuestionComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class QuizRoutingModule {
}
