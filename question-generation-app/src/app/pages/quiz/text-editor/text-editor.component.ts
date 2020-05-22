import { Component, OnInit, Injectable, ViewChild, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, PasteCleanupService, 
          RichTextEditorComponent, CommandName } from '@syncfusion/ej2-angular-richtexteditor';

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

  @Input('textValue') textValue: String; 
  @Input('tokens') tokens: String[];
  @Output() newToken = new EventEmitter();

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
    <table style="border: none; width: 100%;">
      <tr>
        <td style="border: none; text-align: center;" colspan="2"> 
          <h3>Simply copy and paste text here…</h3>
          <p>Here’s a few tips before you start:</p>
        </td>
      </tr>
      <tr>
        <td style="border: none; width: 50%;">
          <p>Quiz Generator absolutely loves fact-based content, even if it’s quite complex…</p>
        </td>
        <td style="border: none; width: 50%; text-align: right;">
          <p>…but struggles with content that might be too cryptic, metaphorical or inferential.</p>
        </td>
      </tr>
      <tr>
        <td style="border: none; text-align: center;">
          <img src="/assets/icon-happy.png"/>
        </td>
        <td style="border: none; text-align: center;">
          <img src="/assets/icon-happy.png"/>
        </td>
      </tr>
      <tr>
        <td style="border: none; width: 50%;">
          <p>Example: “The circulatory system, also called the cardiovascular system or the vascular system, is an organ system that permits blood to circulate and transport nutrients (such as amino acids and electrolytes), oxygen, carbon dioxide, hormones, and blood cells to and from the cells in the body to provide nourishment and help in fighting diseases, stabilize temperature and pH, and maintain homeostasis.”</p>
        </td>
        <td style="border: none; width: 50%; text-align: right;">
          <p>Example: “They have tied me to a stake. I cannot fly,
              <br/>
              But, bearlike, I must fight the course. What’s he
              <br/>
              That was not born of woman? Such a one
              <br/>
              Am I to fear, or none..
              <br/>
              <br/>
              -William Shakespeamre
              <br/>newToken
        </td>
      </tr>
    </table>
  `;



  // public customHTMLModel: IHtmlFormatterModel = { // formatter is used to configure the custom key
  //   keyConfig: {
  //   'insert-link': 'ctrl+q', // confite the desired key
  //   }
  //   };
  //   public formatter: any = new HTMLFormatter(this.customHTMLModel); // to configure custom key

  constructor() { 
   
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.textArea = this.rteObj.contentModule.getEditPanel() as HTMLElement; 
    this.textArea.onclick = (event) => {
      console.log("click 2", this.rteObj.getSelection(), this.rteObj.getHtml(), 
                              this.rteObj.getRange());
      let selection : String =  this.rteObj.getSelection();
      if (selection.length > 0) {
        
        this.rteObj.executeCommand("backColor", "#ff0000");
        this.newToken.emit(selection);
      }
    }
    // let range : Range = new Range();//this.rteObj.getRange();
    // let rootNode = this.rteObj.element.getRootNode();
    // range.setStart(this.rteObj.element, 29);
    // range.setEnd(this.rteObj.element, 35);
    // this.rteObj.element.querySelectorAll("*").forEach((e) => {
    //   console.log("e", e.textContent);
    // });
    // console.log('range', this.rteObj.getRange());
    // this.rteObj.selectRange(range)
    // range.setStart(range.surroundContents)
    // range.setSsetStartAfter() = 20;
    // range.startOffset = 20;   
    // this.rteObj.selectRange()
    // this.rteObj.executeCommand("backColor", "#ff0000")
  }

  editorEvent(event): void {
    console.log("event", event);
  }
}
