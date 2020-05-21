import { Component, OnInit, Injectable, ViewChild, Input } from '@angular/core';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, PasteCleanupService, 
          RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, PasteCleanupService]
})

/**
 * https://ej2.syncfusion.com/angular/demos/rich-text-editor/paste-cleanup/
 * https://ej2.syncfusion.com/angular/documentation/api/rich-text-editor/pasteCleanupSettings/
 * 
 */
@Injectable({
  providedIn: 'root'
})
export class TextEditorComponent implements OnInit {

  @Input('value') value: String = "dd"; 
  @Input('tokens') tokens: String[];

  @ViewChild('toolsRTE') public rteObj: RichTextEditorComponent;

  private textArea: HTMLElement;
  

  private tools: object = {
    enable: false
    // type: 'Expand',
    // items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
    //         'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
    //         'LowerCase', 'UpperCase', '|',
    //         'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
    //         'Outdent', 'Indent', '|',
    //         'CreateLink', 'Image', '|', 'ClearFormat', 'Print',
    //         'SourceCode', 'FullScreen', '|', 'Undo', 'Redo']
  };

  private pasteCleanup: object = {
    keepFormat: false,
  }

  private placeholder = `
  
    <table border="0"><tr><td>Hello</td><td>Hello</td></tr></table>
  
  `;




  constructor() { 
   
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {


      
    this.textArea = this.rteObj.contentModule.getEditPanel() as HTMLElement; 
    this.textArea.onclick = (event) => {
      console.log("click 2", this.rteObj.getSelection(), this.rteObj.getText());
      // rteObj.executeCommand()
    }
  }

  editorEvent(event): void {
    console.log("event", event);
  }
}
