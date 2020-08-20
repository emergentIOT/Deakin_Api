import { Component, OnInit, ɵConsole, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IVideoService } from './ivideo.service';
import { IVideo } from 'src/app/interfaces/IVideo';
import { ChipList, ChipModel } from '@syncfusion/ej2-angular-buttons';
import { AppConfigService } from '../../services/app-config/app-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmpty } from 'npm-stringutils';

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
  transcriptionBlocks = [];
  transcriptionText: string = '';
  searchPhrase: string;
  questionAnswerList: any[] = [];
  questionAnswerChipList: string[] = [];
  iVideoId : string;
  isSearching : boolean = false;

  constructor(private http: HttpClient, 
    private iVideoService : IVideoService, 
    private appConfigService: AppConfigService,
    private route: ActivatedRoute, 
    private router: Router) {

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

            // TEST
            // this.searchPhrase = "core body";
            // this.onSearch();
          });
    
        })    
        
        setInterval(() => {
          if (this.videoElement) {
            var time = this.videoElement.currentTime * 1000;
            for (var i = 0; i < this.transcriptionBlocks.length; i++) {
              if (this.transcriptionBlocks[i].s <= time && this.transcriptionBlocks[i].e >= time) {
                this.transcriptionBlocks[i].isPlaying = true;
              } else {
                this.transcriptionBlocks[i].isPlaying = false;
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

  onTranscriptionBlockClick(block) {
    this.playVideo(block.s, false);
  }

  onGenerateQuiz() {
    this.router.navigate(['edit-quiz', {
        quizName: this.iVideo.name, 
        quizText: this.transcriptionText 
      }]);
  }

  onSearch() {
    if (isEmpty(this.searchPhrase)) {
      return;
    }
    this.isSearching = true;
    let questionAnswer = {
      question: this.searchPhrase,
      matchedTranscriptionBlockIndexes: null,
      answerText: null
    }

    const headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    const data = "context=" + encodeURIComponent(this.transcriptionText)
      + "&question_to=" + this.searchPhrase
      + "&mode=qna";

    this.http.post("https://des-inno-qnabot.its.deakin.edu.au/", data, {
      headers: headers,
      responseType: "text"
    }).subscribe((answerText: any) => {

      questionAnswer.answerText = answerText;

      var answerTextSplit = answerText.split(' ');

      var matchedBlockIndexes = [];

      this.transcriptionBlocks.forEach((item: any, index) => {

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


      if (matchedBlockIndexes.length > 0) {
        questionAnswer.matchedTranscriptionBlockIndexes = matchedBlockIndexes;
        this.addQuestionAnswer(questionAnswer);
        this.hightlightSearchResult(matchedBlockIndexes);
        this.searchPhrase = "";
        // TOOK out, doesn't seem to be user friendly
        // let transcriptionBlock = this.transcriptionBlocks[questionAnswer.matchedTranscriptionBlockIndexes[0]];
        // this.pauseVideo(transcriptionBlock.s);
      }

      this.isSearching = false;
    }, error => {
      this.isSearching = false;
      console.error(error);
    });
  }

  hightlightSearchResult(matchedBlockIndexes : number[]) {
    this.transcriptionBlocks.forEach((item: any, index) => {
      item.isSearchResult = false;
    });
    matchedBlockIndexes.forEach((blockIndex) => {
      this.transcriptionBlocks[blockIndex].isSearchResult = true;
    });
  }

  playAnswer({text, index}) {
    if (index >= 0) {
      let questionAnswer = this.questionAnswerList[index];
      if (questionAnswer && questionAnswer.matchedTranscriptionBlockIndexes) {
        // take the first word / block in the matched blocks and play
        let transcriptionBlock = this.transcriptionBlocks[questionAnswer.matchedTranscriptionBlockIndexes[0]];
        this.playVideo(transcriptionBlock.s, true);
        this.hightlightSearchResult(questionAnswer.matchedTranscriptionBlockIndexes);
      }
    }
  }

  addQuestionAnswer(questionAnswer) {
    this.questionAnswerList.push(questionAnswer);
    this.questionAnswerChipList.push(
      this.upperCaseFirst(questionAnswer.question) + "? " + questionAnswer.answerText);
    this.chipsList.refresh();
  }

  upperCaseFirst(str) {
    if (isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  deleteQuestionAnswer({text, index}) {
    this.questionAnswerList = this.questionAnswerList.filter((obj, i) => i !== index);
    this.questionAnswerChipList = this.questionAnswerChipList.filter((obj, i) => i !== index);
  }

  playVideo(time, beginningOfSentence) {
    console.log('playVideo', time, beginningOfSentence);
    if (beginningOfSentence) {
      time = Math.max(0, time - 1000);
    }
    if (time >= 0) {
      this.videoElement.play();
      this.videoElement.pause();      
      this.videoElement.currentTime = time / 1000;
      this.videoElement.play();
    }
  }

  pauseVideo(time) {
    console.log('pauseVideo', time);
    if (time >= 0) {
      this.videoElement.play();
      this.videoElement.pause();      
      this.videoElement.currentTime = time / 1000;
      this.videoElement.pause();
    }
  }
  

}
