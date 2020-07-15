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
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [QuizComponent, QuizListComponent, TextEditorComponent],
  imports: [CommonModule, QuizRoutingModule, DesCardModule, DesButtonModule, TabsModule, DesAlertPanelModule, 
    RichTextEditorModule, ChipListModule, FormsModule],
  exports: [QuizComponent, QuizListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuizModule {}



