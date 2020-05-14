import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomePanelComponent } from './welcome-panel.component';
import { CopyToClipboardComponent } from '../../../shared/ui-components/copy-to-clipboard/copy-to-clipboard.component';

@NgModule({
  declarations: [WelcomePanelComponent, CopyToClipboardComponent],
  imports: [CommonModule],
  exports: [WelcomePanelComponent]
})
export class WelcomePanelModule {}
