import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WelcomePanelModule } from './welcome-panel/welcome-panel.module';
import { BadgeComponent } from '../../shared/ui-components/badge/badge.component';
import { QuizModule } from '../quiz/quiz.module';

@NgModule({
  declarations: [
    HomeComponent,
    BadgeComponent // TODO: consider moving elsewhere depending on where used
  ],
  imports: [
    CommonModule,
    WelcomePanelModule,
    HomeRoutingModule,
    QuizModule
  ],
  exports: [HomeComponent]
})
export class HomeModule {}
