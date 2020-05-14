import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherRoutingModule } from './other-routing.module';
import { OtherComponent } from './other.component';

@NgModule({
  declarations: [OtherComponent],
  imports: [CommonModule, OtherRoutingModule],
  exports: [OtherComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OtherModule {}
