import { Component, OnInit, ɵConsole } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IVideoService } from './ivideo.service';
import { IVideo } from 'src/app/interfaces/IVideo';
import { AppConfigService } from '../../services/app-config/app-config.service';

@Component({
  selector: ' ivideo',
  templateUrl: './ivideo.component.html',
  styleUrls: ['./ivideo.component.scss']
})
export class  IVideoComponent implements OnInit {

  isLoaded : boolean = false;
  iVideo: IVideo;
  // Video: any;
  // JSON: any;
  videoDataUrl: any;
  videoElement: any;
  title = 'VideoNavigation';
  transcriptionBlocks = [];
  transcriptionText: string = '';
  pauseTime: any;
  searchContent: string;
  keys: any[] = [];
  responses: any[] = [];

  constructor(private http: HttpClient, private iVideoService : IVideoService, private appConfigService: AppConfigService) {

  }

  ngOnInit() {

    this.iVideoService.getIVideo("001").subscribe(iVideo => {
      
      this.iVideo = iVideo;
      
      this.iVideoService.getTranscription(iVideo).subscribe(transcription => {
        this.transcriptionBlocks = transcription;
        this.transcriptionBlocks.forEach((b) => {
          this.transcriptionText += " " + b.w;
        });
        this.loadVideo(this.appConfigService.apiUrl + this.iVideo.videoUrl, () => {

          this.videoElement = document.getElementById('myvideo') as any;

          this.isLoaded = true;
        });
      });

    })    
    
    setInterval(() => {
      if (this.videoElement) {
        var time = this.videoElement.currentTime * 1000;
        for (var i = 0; i < this.transcriptionBlocks.length; i++) {
          if (this.transcriptionBlocks[i].s <= time && this.transcriptionBlocks[i].e >= time) {
            this.transcriptionBlocks[i].isSelected = true;
          }
          else {
            this.transcriptionBlocks[i].isSelected = false;
          }
        }
      }
    }, 1000);

  }

  loadVideo(videoDataUrl : string, cb) {
    
    var request = new XMLHttpRequest();
    request.open('GET', videoDataUrl, true);
    request.responseType = 'blob';
    request.onload = () => {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  (e) => {
            console.log('DataURL:', e.target.result);
            this.videoDataUrl = reader.result;
            cb();

        };
    };
    request.send();

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
    this.videoElement = document.getElementById('myvideo') as any;
    for (var i = 0; i < this.transcriptionBlocks.length; i++) {
      if (this.transcriptionBlocks[i].i == selection.value) {
        var time = this.transcriptionBlocks[i].s;
        if (time) {
          this.videoElement.play();
          this.videoElement.pause();
          this.videoElement.currentTime = time / 1000;
          this.videoElement.play();
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
    this.videoElement = document.getElementById('myvideo') as any;
    for (var i = 0; i < this.transcriptionBlocks.length; i++) {

      if (this.transcriptionBlocks[i].w.includes(words[0])) {
        var time = this.transcriptionBlocks[i].s;
        if (time) {
          this.videoElement.play();
          this.videoElement.pause();
          this.videoElement.currentTime = time / 1000;
          this.videoElement.play();
        }

        break;

      }
    }
  }

  onTextClick(e) {
    var selectedText = this.getSelectText(e);
    this.playVideoOnText(selectedText);
  }

  // onVideoUpload(filePath) {
  //   this.Video = filePath;// event.target.files[0];
  //   var reader = new FileReader();
  //   reader.readAsDataURL(this.Video);
  //   reader.onload = (_event) => {
  //     this.videoDataUrl = reader.result;
  //     this.setElement();
  //   }
  // }

  // onFileUpload(filePath) {
  //   this.JSON = filePath;

  //   var reader = new FileReader();
  //   reader.readAsDataURL(this.JSON);
  //   reader.onload = (_event) => {
  //     var file = reader.result as any;

  //     this.transcriptionBlocks = JSON.parse(file);

  //     this.transcriptionBlocks.forEach((b) => {
  //       this.transcriptionText += " " + b.w;
  //     });

  //     this.setElement();
  //   }
  // }

  // setElement() {
  //   if (this.Video && this.JSON) {
  //     this.videoElement = document.getElementById('myvideo') as any;
  //   }
  // }

  onSearch() {
    var text = this.transcriptionText;
    var searchContent = this.searchContent;

    const headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    const data = "context=" + encodeURIComponent(this.transcriptionText)
      + "&question_to=" + this.searchContent
      + "&mode=qna";

    this.http.post("https://des-inno-qnabot.its.deakin.edu.au/", data, {
      headers: headers,
      responseType: "text"
    }).subscribe((res: any) => {

      var phraseFromResponse = res;

      var splited = phraseFromResponse.split(' ');

      var found = [];

      this.transcriptionBlocks.forEach((item: any, index) => {

        item.isGray = false;

        if (!found.length) {
          found = [];
          if (item.w == splited[0]) {
            var tillRun = (index + splited.length) - 1;
            found.push(index);

            var splitIndex = 1;
            for (var i = index + 1; i <= tillRun; i++) {
              if (splited[splitIndex] == this.transcriptionBlocks[i].w) {
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
        this.transcriptionBlocks[item].isGray = true;
      });


      if (found.length) {
        this.pauseVideoOnPhrase(found[0]);
      }
    }, error => {

    });
  }


  pauseVideoOnPhrase(i) {
    var time = this.transcriptionBlocks[i].s;
    if (time) {

      this.videoElement.play();
      this.videoElement.pause();      
      this.videoElement.currentTime = ((time - 2000) / 1000);
      this.videoElement.pause();

      this.pauseTime = time;
    }
  }

  playOnPhrase() {

    this.videoElement.play();
    this.videoElement.pause();
    this.videoElement.currentTime = ((this.pauseTime - 2000) / 1000);
    this.videoElement.play();

    this.pauseTime = null;

    this.transcriptionBlocks.map(c => {
      c.isGray = false;
    });

  }

  getKeys() {
    const headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    this.http.post("http://research-gpu-poc-fs1.its.deakin.edu.au:8891/", { // replace this with suggested answer token generation API
      "context": this.transcriptionText
    }).subscribe((res: any) => {
      res = { keys: ["key1", "key2", "key3"] };
      this.keys = res.answer_tokens;
    }, error => {
      console.log(error);
    });
  }

  getResponse() {
    this.http.post("http://localhost:3000/v1/auth/login", { // replace this with question generation API
      "myData": this.transcriptionText,
      "keys": this.keys
    }).subscribe((res: any) => {
      res = { response: ["resp1", "resp2 resp3 resp3 resp3 resp3 resp3 resp3 ", "resp3 resp3 resp3 resp3 resp3 resp3 resp3 resp3 "] };
      this.responses = res.response;
    }, error => {
      console.log(error);

    });
  }

  removeKey(index) {
    this.keys.splice(index, 1);
  }

}
