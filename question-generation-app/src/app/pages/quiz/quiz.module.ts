import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizRoutingModule } from './quiz-routing.module';
import { QuizComponent } from './quiz.component';
import { QuizListComponent } from './quiz-list.component';
import { DesAlertPanelModule } from '@des-ds-dev-kit/components-browser-ng';
import { DesCardModule, DesButtonModule } from '@des-ds-dev-kit/components-global-ng';
import { TabsModule } from '../../shared/ui-components/tabs/tabs.module';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//Pagination 
import {NgxPaginationModule} from 'ngx-pagination'
// Search Quizzes module
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { EditQuestionComponent } from './edit-question/edit-question.component';
import { AccordionModule } from '../../shared/ui-components/accordion/accordion.module';
@NgModule({
  declarations: [QuizComponent, QuizListComponent, TextEditorComponent, EditQuestionComponent],
  imports: [CommonModule, QuizRoutingModule, DesCardModule, DesButtonModule, TabsModule, 
    RichTextEditorModule, ChipListModule, FormsModule, Ng2SearchPipeModule, NgxPaginationModule, DialogModule,
  ReactiveFormsModule, AccordionModule],
  exports: [QuizComponent, QuizListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuizModule {}



