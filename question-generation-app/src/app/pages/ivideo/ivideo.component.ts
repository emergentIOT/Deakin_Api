import { Component, OnInit, ɵConsole } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: ' ivideo',
  templateUrl: './ivideo.component.html',
  styleUrls: ['./ivideo.component.css']
})
export class  IVideoComponent implements OnInit {
  Video: any;
  JSON: any;
  VideoUrl: any;
  VideoElement: any;
  title = 'VideoNavigation';
  Blocks = [];
  Text: string = '';
  PauseTime: any;
  SearchContent: string;
  Keys: any[] = [];
  Responses: any[] = [];

  constructor(private http: HttpClient) {

  }

  ngOnInit() {

    setInterval(() => {
      if (this.VideoElement) {
        var time = this.VideoElement.currentTime * 1000;
        for (var i = 0; i < this.Blocks.length; i++) {
          if (this.Blocks[i].s <= time && this.Blocks[i].e >= time) {
            this.Blocks[i].IsSelected = true;
          }
          else {
            this.Blocks[i].IsSelected = false;
          }
        }
      }
    }, 1000);
  }

  getSelectText(e) {
    var range = document.createRange();
    range.selectNode(e.target);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    return { text: e.target.innerText, value: e.target.getAttribute("data-sectionvalue") };
  }

  getSeconds(time) {
    var hms = time;
    var a = hms.split(':');

    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

    return seconds;
  }

  playVideoOnText(selection) {
    this.VideoElement = document.getElementById('myvideo') as any;
    for (var i = 0; i < this.Blocks.length; i++) {
      if (this.Blocks[i].i == selection.value) {
        var time = this.Blocks[i].s;
        if (time) {
          this.VideoElement.play();
          this.VideoElement.pause();
          this.VideoElement.currentTime = time / 1000;
          this.VideoElement.play();
        }
        break;
      }
    }
  }



  playVideoOnPhrase(phrase) {

    if (!phrase.trim()) {
      // no phrase
      return;
    }

    var words = phrase.split(' ');
    this.VideoElement = document.getElementById('myvideo') as any;
    for (var i = 0; i < this.Blocks.length; i++) {

      if (this.Blocks[i].w.includes(words[0])) {
        var time = this.Blocks[i].s;
        if (time) {
          this.VideoElement.play();
          this.VideoElement.pause();
          this.VideoElement.currentTime = time / 1000;
          this.VideoElement.play();
        }

        break;

      }
    }
  }

  onTextClick(e) {
    var SelectedText = this.getSelectText(e);


    this.playVideoOnText(SelectedText);
  }

  onVideoUpload(event) {
    this.Video = event.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(this.Video);
    reader.onload = (_event) => {
      this.VideoUrl = reader.result;
      this.setElement();
    }
  }

  onFileUpload(event) {
    this.JSON = event.target.files[0];

    var reader = new FileReader();
    reader.readAsText(this.JSON);
    reader.onload = (_event) => {
      var file = reader.result as any;

      this.Blocks = JSON.parse(file);

      this.Blocks.forEach((b) => {
        this.Text += " " + b.w;
      });

      this.setElement();
    }


  }

  setElement() {
    if (this.Video && this.JSON) {
      this.VideoElement = document.getElementById('myvideo') as any;
    }
  }

  onSearch() {
    var text = this.Text;
    var searchContent = this.SearchContent;

    const headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    const data = "context=" + encodeURIComponent(this.Text)
      + "&question_to=" + this.SearchContent
      + "&mode=qna";

    this.http.post("https://des-inno-qnabot.its.deakin.edu.au/", data, {
      headers: headers,
      responseType: "text"
    }).subscribe((res: any) => {

      var phraseFromResponse = res;

      var splited = phraseFromResponse.split(' ');

      var found = [];

      this.Blocks.forEach((item: any, index) => {

        item.isGray = false;

        if (!found.length) {
          found = [];
          if (item.w == splited[0]) {
            var tillRun = (index + splited.length) - 1;
            found.push(index);

            var splitIndex = 1;
            for (var i = index + 1; i <= tillRun; i++) {
              if (splited[splitIndex] == this.Blocks[i].w) {
                found.push(i);
              }
              else {
                found = [];
                break;
              }

              splitIndex++;
            }
          }
        }


      });


      found.forEach((item) => {
        this.Blocks[item].isGray = true;
      });


      if (found.length) {
        this.pauseVideoOnPhrase(found[0]);
      }
    }, error => {

    });
  }


  pauseVideoOnPhrase(i) {
    var time = this.Blocks[i].s;
    if (time) {

      this.VideoElement.play();
      this.VideoElement.pause();      
      this.VideoElement.currentTime = ((time - 2000) / 1000);
      this.VideoElement.pause();

      this.PauseTime = time;
    }
  }

  playOnPhrase() {

    this.VideoElement.play();
    this.VideoElement.pause();
    this.VideoElement.currentTime = ((this.PauseTime - 2000) / 1000);
    this.VideoElement.play();

    this.PauseTime = null;

    this.Blocks.map(c => {
      c.isGray = false;
    });

  }

  getKeys() {
    const headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    this.http.post("http://research-gpu-poc-fs1.its.deakin.edu.au:8891/", { // replace this with suggested answer token generation API
      "context": this.Text
    }).subscribe((res: any) => {
      res = { keys: ["key1", "key2", "key3"] };
      this.Keys = res.answer_tokens;
    }, error => {
      console.log(error);
    });
  }

  getResponse() {
    this.http.post("http://localhost:3000/v1/auth/login", { // replace this with question generation API
      "myData": this.Text,
      "keys": this.Keys
    }).subscribe((res: any) => {
      res = { response: ["resp1", "resp2 resp3 resp3 resp3 resp3 resp3 resp3 ", "resp3 resp3 resp3 resp3 resp3 resp3 resp3 resp3 "] };
      this.Responses = res.response;
    }, error => {
      console.log(error);

    });
  }

  removeKey(index) {
    this.Keys.splice(index, 1);
  }

}
