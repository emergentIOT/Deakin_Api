import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OtherComponent } from './other.component';

const routes: Routes = [
  { path: 'other', component: OtherComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class OtherRoutingModule {
}
