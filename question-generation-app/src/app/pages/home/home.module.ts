import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WelcomePanelModule } from './welcome-panel/welcome-panel.module';
import { FeaturedModule } from './featured/featured.module';
import { BadgeComponent } from '../../shared/ui-components/badge/badge.component';

@NgModule({
  declarations: [
    HomeComponent,
    BadgeComponent // TODO: consider moving elsewhere depending on where used
  ],
  imports: [
    CommonModule,
    WelcomePanelModule,
    HomeRoutingModule,
    FeaturedModule
  ],
  exports: [HomeComponent]
})
export class HomeModule {}