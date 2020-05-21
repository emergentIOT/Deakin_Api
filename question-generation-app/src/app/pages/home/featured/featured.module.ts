import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesCardModule, DesButtonModule } from '@des-ds-dev-kit/components-global-ng';
import { FeaturedComponent } from './featured.component';



@NgModule({
  declarations: [
    FeaturedComponent
  ],
  imports: [
    CommonModule,
    DesCardModule, DesButtonModule
  ],
  exports: [
    FeaturedComponent
  ]
})
export class FeaturedModule { }
