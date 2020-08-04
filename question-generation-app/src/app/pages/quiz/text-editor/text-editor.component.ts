import { Component, OnInit, Injectable, ViewChild, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, PasteCleanupService, 
          RichTextEditorComponent, CommandName } from '@syncfusion/ej2-angular-richtexteditor';
import { isEmpty } from 'npm-stringutils';
import { escapeRegExp } from '../quiz-utils';

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
 * Ref:
 * https://javascript.info/selection-range
 * 
 */
@Injectable({
  providedIn: 'root'
})
export class TextEditorComponent implements OnInit {

  private HIGHLIGHT_COLOR : String = "#85C17A";

  @Input('textValue') textValue: string; 
  @Input('tokens') tokens: string[];
  @Output() newToken = new EventEmitter();
  @Output() generateSuggestedAnswerTokens = new EventEmitter();

  @ViewChild('toolsRTE') public rteObj: RichTextEditorComponent;

  private textArea: HTMLElement;
  

  public tools: object = {
    enable: false
  };

  public pasteCleanup: object = {
    keepFormat: false,
  }

  public placeholder = `
    <table style="border: none; width: 100%;">
      <tr>
        <td style="border: none; text-align: center;" colspan="2"> 
          <h4>Simply copy and paste text here…</h4>
          <h4>Then select key phrases you would like to generate questions for.</h4>
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
          <img src="/assets/icon-dodgy.png"/>
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


  constructor(private ngZone: NgZone) { 
   
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    if (!this.rteObj || !this.rteObj.contentModule) {
      return; // maybe running tests
    }
    this.textArea = this.rteObj.contentModule.getEditPanel() as HTMLElement; 
    this.textArea.onclick = (event) => {
      let selection : string =  this.rteObj.getSelection().trim();
      let text : string = this.rteObj.getText();
      let range : Range = this.rteObj.getRange();
      //console.log(this.rteObj.getHtml(), selection, range.startOffset, range.endOffset);
      this.newToken.emit(selection);
    }
    this.textArea.onpaste = (event) => {
      let data = event.clipboardData.getData("text");
      this.generateSuggestedAnswerTokens.emit({data});
    }
  }

  selectTokens(tokens : string[]) : string {
    let updatedRichText = this. selectTokensInText(tokens, this.rteObj.getHtml());
    this.rteObj.updateValue(updatedRichText);
    return updatedRichText;
  }

  selectTokensAndUpdateText(tokens : string[], richText : string) : string {
    let updatedRichText = this. selectTokensInText(tokens, richText);
    this.rteObj.updateValue(updatedRichText);
    return updatedRichText;
  }

  updateRichText(richText : string) {
    this.rteObj.updateValue(richText);
  }

  /**
   * 
   * @param tokens 
   * @param text 
   * @returns The text with the tokens selected
   */
  selectTokensInText(tokens : string[], text : string) : string {
    this.tokens = tokens;
    let result = text;
    for (let token of this.tokens) {
      result = this.selectTokenInText(token, result);
    }
    return result;
  }

  /**
   * 
   * @param token 
   * @param text 
   * @returns The text with the tokens selected
   */
  selectTokenInText(token : string, text: string) {
    if (isEmpty(token) || isEmpty(text)) {
      return text;
    }
    let regex = new RegExp("\\b(" + escapeRegExp(token) + ")\\b(?!</span>)", "mig");
    let result = text.replace(regex, (subString : string): string => {
      return '<span style="background-color: ' + this.HIGHLIGHT_COLOR + ';">' + subString + "</span>";
    });
    return result;
  }

  public getRichText() {
    return this.removeHighLights(this.rteObj.getHtml());
  }

  public getPlainText() {
    return this.rteObj.getText();
  }

  public hasPlainText() {
    return !isEmpty(this.getPlainText());
  }
  
  deleteToken(token : string) {
    this.tokens = this.tokens.filter(obj => obj !== token);
    this.rteObj.updateValue(this.removeHighLight(token, this.rteObj.getHtml()));
  }

  clearTokens() {
    this.tokens = [];
    this.rteObj.updateValue(this.removeHighLights(this.rteObj.getHtml()));
  }

  removeHighLights(plainText: string) {
    if (isEmpty(plainText)) {
      return plainText;
    }
    let regExStr = '(<span style="background-color: ' + this.HIGHLIGHT_COLOR + ';">)(.+?)(</span>)';
    let regex = new RegExp(regExStr, "mig");
    let result = plainText.replace(regex, (g1 : string, g2 : string, g3 : string, g4 : string): string => {
      return g3;
    });
    return result;
  }

  removeHighLight(token: string, plainText: string) {
    if (isEmpty(plainText)) {
      return plainText;
    }
    let regExStr = '(<span style="background-color: ' + this.HIGHLIGHT_COLOR + ';">)(' + 
                    escapeRegExp(token) + ')(</span>)';
    let regex = new RegExp(regExStr, "mig");
    let result = plainText.replace(regex, (g1 : string, g2 : string, g3 : string, g4 : string): string => {
      return g3;
    });
    return result;
  }


}
