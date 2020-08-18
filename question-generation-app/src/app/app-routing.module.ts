import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules and components for routed features
import { HomeModule } from './pages/home/home.module';
import { OtherModule } from './pages/other/other.module';
import { QuizModule } from './pages/quiz/quiz.module';
import { IVideoListModule } from './pages/ivideo/ivideo-list.module';
import { LoginModule } from './pages/login/login.module';
import { PageNotFoundComponent } from './shared/ui-components/page-not-found/page-not-found.component';

// Other routes are defined in the respective page modules
const appRoutes: Routes = [{ path: '**', component: PageNotFoundComponent }];

@NgModule({
  declarations: [PageNotFoundComponent],
  imports: [
    CommonModule,
    HomeModule,
    OtherModule,
    QuizModule,
    IVideoListModule,
    LoginModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule {}
