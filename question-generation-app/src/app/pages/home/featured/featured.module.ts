import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesCardModule } from '@des-ds-dev-kit/components-global-ng';
import { FeaturedComponent } from './featured.component';



@NgModule({
  declarations: [
    FeaturedComponent
  ],
  imports: [
    CommonModule,
    DesCardModule
  ],
  exports: [
    FeaturedComponent
  ]
})
export class FeaturedModule { }
