import { Component, OnInit, ViewChild } from '@angular/core';
import { ChipList } from '@syncfusion/ej2-angular-buttons';
import { TextEditorComponent } from './text-editor/text-editor.component';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {

  @ViewChild('chipsList') public chipsList: ChipList;
  @ViewChild('textEditor') public textEditor: TextEditorComponent;

  private tokens: String[] = ["circulatory", "cardiovascular"];
  public textValue: String = "The circulatory system, <b>also</b> <table><tr><td>asdfasfd</td></tr></table> called the cardiovascular system or the vascular system, is an organ system that permits blood to circulate and transport nutrients (such as amino acids and electrolytes), oxygen, carbon dioxide, hormones, and blood cells to and from the cells in the body to provide nourishment and help in fighting diseases, stabilize temperature and pH, and maintain homeostasis.";

  constructor() {}

  ngOnInit() {
    
  }


  newToken(token : String) {
    this.tokens.push(token);
    this.chipsList.refresh();
  }

  deleteToken({text, index}) {
    this.textEditor.deleteToken(text);
    console.log("deleted", this.tokens, text, index);
  }
}
