import { Component, OnInit, ɵConsole, ViewChild, ɵpublishDefaultGlobalUtils } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IVideoService } from './ivideo.service';
import { IVideo } from 'src/app/interfaces/IVideo';
import { ChipList, ChipModel } from '@syncfusion/ej2-angular-buttons';
import { AppConfigService } from '../../services/app-config/app-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmpty } from 'npm-stringutils';
import { IQuestionAnswer } from 'src/app/interfaces/IQuestionAnswer';
import { IQuizUpdate } from 'src/app/interfaces/iQuizUpdate';
import { QuizService } from 'src/app/services/quiz.service';

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
  questionAnswerChipList: string[] = [];
  iVideoId : string;
  isSearching : boolean = false;

  constructor(private http: HttpClient, 
    private iVideoService : IVideoService, 
    private quizService : QuizService,
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

            if (this.iVideo.questions) {
              this.iVideo.questions.forEach((questionAnswer : any) => {
                var matchedBlockIndexes = this.calcMatchedBlockIndexes(questionAnswer.answerText, 
                                                                       this.transcriptionBlocks);
                if (matchedBlockIndexes.length > 0) {
                  questionAnswer.matchedTranscriptionBlockIndexes = matchedBlockIndexes;
                  this.addQuestionAnswerToChipList(questionAnswer);
                }
  
              });
            }

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
    if (!this.iVideo.quizId) {
      // If no quiz created yet, create one and update ivideo with quizId
      let answerTokens = [];
      this.iVideo.questions.forEach(questionAnswer => { answerTokens.push(questionAnswer.answerText)});
      let quiz : IQuizUpdate = {
        name: this.iVideo.name,
        plainText: this.transcriptionText,
        richText: this.transcriptionText,
        answerTokens
      };
      this.quizService.save(quiz).subscribe(quizId => {
        this.iVideo.quizId = quizId;
        this.iVideoService.save(this.iVideo).subscribe();
        this.router.navigate(['edit-quiz', this.iVideo.quizId]);
      });

    } else {
      this.router.navigate(['edit-quiz', this.iVideo.quizId]);
    }
  }

  onSearch() {
    if (isEmpty(this.searchPhrase)) {
      return;
    }
    this.isSearching = true;
    let questionAnswer : IQuestionAnswer = {
      questionText: this.searchPhrase,
      answerText: null,
      matchedTranscriptionBlockIndexes: null
    }

     this.iVideoService.getQuestionAnswer(this.iVideoId ,this.searchPhrase).subscribe((answerText: any) => {
       
      questionAnswer.answerText = answerText;
      this.saveQuestionAnswer(questionAnswer);

      var matchedBlockIndexes = this.calcMatchedBlockIndexes(answerText, 
                                                    this.transcriptionBlocks);
      
      if (matchedBlockIndexes.length > 0) {
        questionAnswer.matchedTranscriptionBlockIndexes = matchedBlockIndexes;
        this.addQuestionAnswerToChipList(questionAnswer, true);
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

  calcMatchedBlockIndexes(answerText : string, transcriptionBlocks : any[]) : number[] {

    var answerTextSplit = answerText.split(' ');

    var matchedBlockIndexes = [];

    transcriptionBlocks.forEach((item: any, index) => {

      if (matchedBlockIndexes.length == 0) {
        matchedBlockIndexes = [];
        if (item.w == answerTextSplit[0]) {
          var tillRun = (index + answerTextSplit.length) - 1;
          matchedBlockIndexes.push(index);

          var answerTextSplitIndex = 1;
          for (var i = index + 1; i <= tillRun; i++) {
            if (answerTextSplit[answerTextSplitIndex] == transcriptionBlocks[i].w) {
              matchedBlockIndexes.push(i);
            }
            else {
              console.log('Did not match', answerTextSplit[answerTextSplitIndex] , transcriptionBlocks[i].w);
              matchedBlockIndexes = [];
              break;
            }

            answerTextSplitIndex++;
          }
        }
      }

    });

    return matchedBlockIndexes;

  }

  /**
   * Note questions array is in reverse order to chip list array
   */
  playAnswer({text, index}) {
    if (index >= 0) {
      let questionAnswer : IQuestionAnswer = this.iVideo.questions[this.iVideo.questions.length - 1 - index];
      if (questionAnswer && questionAnswer.matchedTranscriptionBlockIndexes) {
        // take the first word / block in the matched blocks and play
        let transcriptionBlock = this.transcriptionBlocks[questionAnswer.matchedTranscriptionBlockIndexes[0]];
        this.playVideo(transcriptionBlock.s, true);
        this.hightlightSearchResult(questionAnswer.matchedTranscriptionBlockIndexes);
      }
    }
  }

  saveQuestionAnswer(questionAnswer : IQuestionAnswer) {
    if(!this.iVideo.questions) {
      this.iVideo.questions = [];
    }
    this.iVideo.questions.push(questionAnswer);
    this.iVideoService.save(this.iVideo).subscribe();
  }

  addQuestionAnswerToChipList(questionAnswer : IQuestionAnswer, refresh?) {
    let text = `Question: ${this.upperCaseFirst(questionAnswer.questionText)}? Answer: ${questionAnswer.answerText}`;
    this.questionAnswerChipList.unshift(text);
    if (refresh) {
      this.chipsList.refresh();
    }
  }

  upperCaseFirst(str) {
    if (isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Note questions array is in reverse order to chip list array.
   */
  deleteQuestionAnswer({text, index}) {
    this.questionAnswerChipList = this.questionAnswerChipList.filter((obj, i) => i !== index);
    this.iVideo.questions = this.iVideo.questions.filter((obj, i) => i !== (this.iVideo.questions.length - 1 - index));
    this.iVideoService.save(this.iVideo).subscribe();
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
