import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IVideoComponent } from './ivideo.component';
import { IVideoListComponent } from './ivideo-list.component';

import { CommonModule } from '@angular/common';
import { DesAlertPanelModule } from '@des-ds-dev-kit/components-browser-ng';
import { DesCardModule, DesButtonModule } from '@des-ds-dev-kit/components-global-ng';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { WelcomePanelModule } from '../home/welcome-panel/welcome-panel.module';



const routes: Routes = [
  { path: 'edit-ivideo/:iVideoId', component: IVideoComponent }, 
  { path: 'edit-ivideo', component: IVideoComponent },
  { path: 'ivideos', component: IVideoListComponent }
];

@NgModule({
  declarations: [IVideoComponent, IVideoListComponent],
  imports: [
    CommonModule, DesCardModule, DesButtonModule, DesAlertPanelModule, ChipListModule,
    WelcomePanelModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule, IVideoComponent, IVideoListComponent
  ]
})
export class IVideoListModule {
}
