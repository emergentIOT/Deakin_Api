import { Component, OnInit, ɵConsole, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IVideoService } from './ivideo.service';
import { IVideo } from 'src/app/interfaces/IVideo';
import { ChipList, ChipModel } from '@syncfusion/ej2-angular-buttons';
import { AppConfigService } from '../../services/app-config/app-config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: ' ivideo',
  templateUrl: './ivideo.component.html',
  styleUrls: ['./ivideo.component.scss']
})
export class  IVideoComponent implements OnInit {


  @ViewChild('chipsList') public chipsList: ChipList;
  isLoaded : boolean = false;
  iVideo: IVideo;
  videoDataUrl: any;
  $videoElement: any;
  title = 'VideoNavigation';
  transcriptionBlocks = [];
  transcriptionText: string = '';
  searchContent: string;
  questionAnswerList: any[] = [];
  questionAnswerChipList: string[] = [];
  iVideoId : string;

  constructor(private http: HttpClient, 
    private iVideoService : IVideoService, 
    private appConfigService: AppConfigService,
    private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.iVideoId = params.get('iVideoId');
      
      if(this.iVideoId){
        this.iVideoService.getIVideo(this.iVideoId).subscribe(iVideo => {
      
          this.iVideo = iVideo;
          
          this.iVideoService.getTranscription(iVideo).subscribe(transcription => {
            this.transcriptionBlocks = transcription;
            this.transcriptionBlocks.forEach((b) => {
              this.transcriptionText += " " + b.w;
            });
            this.loadVideo(this.appConfigService.apiUrl + this.iVideo.videoUrl, () => {
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
              } else {
                this.transcriptionBlocks[i].isSelected = false;
              }
            }
          }
        }, 200);
      }
    });
   

  }

  get videoElement() {
    if (!this.$videoElement) {
      this.$videoElement = document.getElementById('myvideo');
    }
    return this.$videoElement;
  }

  loadVideo(videoDataUrl : string, cb) {
    
    var request = new XMLHttpRequest();
    request.open('GET', videoDataUrl, true);
    request.responseType = 'blob';
    request.onload = () => {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  (e) => {
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
    for (var i = 0; i < this.transcriptionBlocks.length; i++) {
      if (this.transcriptionBlocks[i].i == selection.value) {
        this.playVideo(this.transcriptionBlocks[i].s, false);
        break;
      }
    }
  }



  // playVideoOnPhrase(phrase) {

  //   if (!phrase.trim()) {
  //     // no phrase
  //     return;
  //   }
  //   var words = phrase.split(' ');
  //   for (var i = 0; i < this.transcriptionBlocks.length; i++) {

  //     if (this.transcriptionBlocks[i].w.includes(words[0])) {
  //       var time = this.transcriptionBlocks[i].s;
  //       if (time) {
  //         this.playVideo(time, false);
  //       }

  //       break;

  //     }
  //   }
  // }

  onTextClick(e) {
    var selectedText = this.getSelectText(e);
    this.playVideoOnText(selectedText);
  }

  onSearch() {
    console.log('onSearch')
    var text = this.transcriptionText;
    var searchContent = this.searchContent;
    let questionAnswer = {
      question: searchContent,
      matchedBlocks: null,
      answerText: null
    }

    const headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    const data = "context=" + encodeURIComponent(this.transcriptionText)
      + "&question_to=" + this.searchContent
      + "&mode=qna";

    this.http.post("https://des-inno-qnabot.its.deakin.edu.au/", data, {
      headers: headers,
      responseType: "text"
    }).subscribe((answerText: any) => {

      questionAnswer.answerText = answerText;

      var answerTextSplit = answerText.split(' ');

      var matchedBlockIndexes = [];

      this.transcriptionBlocks.forEach((item: any, index) => {

        item.isGray = false;

        if (!matchedBlockIndexes.length) {
          matchedBlockIndexes = [];
          if (item.w == answerTextSplit[0]) {
            var tillRun = (index + answerTextSplit.length) - 1;
            matchedBlockIndexes.push(index);

            var answerTextSplitIndex = 1;
            for (var i = index + 1; i <= tillRun; i++) {
              if (answerTextSplit[answerTextSplitIndex] == this.transcriptionBlocks[i].w) {
                matchedBlockIndexes.push(i);
              }
              else {
                matchedBlockIndexes = [];
                break;
              }

              answerTextSplitIndex++;
            }
          }
        }
  
      });

      matchedBlockIndexes.forEach((item) => {
        this.transcriptionBlocks[item].isGray = true;
      });


      if (matchedBlockIndexes.length > 0) {
        questionAnswer.matchedBlocks = matchedBlockIndexes;
        this.addQuestionAnswer(questionAnswer)
        this.pauseVideo(matchedBlockIndexes[0].s);
      }
    }, error => {

    });
  }

  // get questionAnswerList() : string[] {
  //   console.log("questionAnswerList")
  //   let answerList = [];
  //   this.$questionAnswerList.forEach(item => {
  //     answerList.push(item.answerText);
  //   })
  //   return answerList;
  // }

  playAnswer({text, index}) {
    console.log("click", text, index);
    let questionAnswer = this.questionAnswerList[index];
    if (questionAnswer && questionAnswer.matchedBlocks) {
      this.playVideo(questionAnswer.matchedBlocks[0], true);
    }
  }

  addQuestionAnswer(questionAnswer) {
    console.log("addQuestionAns")
    this.questionAnswerList.push(questionAnswer);
    this.questionAnswerChipList.push(questionAnswer.answerText);
    this.chipsList.refresh();
  }

  deleteQuestionAnswer({text, index}) {
    this.questionAnswerList = this.questionAnswerList.filter((obj, i) => i !== index);
    this.questionAnswerChipList = this.questionAnswerChipList.filter((obj, i) => i !== index);
  }

  playVideo(time, beginningOfSentence) {
    if (time >= 0) {
      this.videoElement.play();
      this.videoElement.pause();      
      this.videoElement.currentTime = time / 1000;
      this.videoElement.play();
    }
  }

  pauseVideo(time) {
    if (time >= 0) {
      this.videoElement.play();
      this.videoElement.pause();      
      this.videoElement.currentTime = time / 1000;
      this.videoElement.pause();
    }
  }
  

  // pauseVideoOnPhrase(i) {
  //   var time = this.transcriptionBlocks[i].s;
  //   if (time) {
  //     this.pauseVideo(time - 2000);
  //   }
  // }

  // playOnPhrase(time) {

  //   this.playVideo(time - 2000);

  //   this.transcriptionBlocks.map(c => {
  //     c.isGray = false;
  //   });

  // }

}
