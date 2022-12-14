import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IVideoList } from "../../interfaces/IVideoList";
import { AppConfigService } from '../../services/app-config/app-config.service';
import { publishReplay, refCount, catchError, concatMap, map } from 'rxjs/operators';
import { handleError } from '../../shared/data/util-http';
import { IResponse } from '../../interfaces/iResponse';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { isEmpty } from 'npm-stringutils';
import { IVideo } from 'src/app/interfaces/IVideo';

@Injectable({
  providedIn: 'root'
})
export class IVideoService {

  private CHECK_FOR_QUIZ_INTERVAL_SECONDS = 3;

  private apiUrlIVideos = this.appConfigService.apiUrl + '/api/v1/iv/ivideos';
  private apiUrlIVideo = this.appConfigService.apiUrl + '/api/v1/iv/ivideo';
  private apiUrlIVideoQuestionAnswer = this.appConfigService.apiUrl + '/api/v1/iv/answer-question'
  private apiUrlIVideoSrtToJson = this.appConfigService.apiUrl + '/api/v1/iv/srtToJson';

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  askQuestion( transcription: string, question: string) : Observable<string>{
    let IVideoId = "22";
    let body = {transcription, question};
    return  this.http.put<IResponse<string>>(`${this.apiUrlIVideoQuestionAnswer}/${IVideoId}`, body).pipe(
      map<IResponse<string>, string>(res => res.data)
    );
  }


  getIVideo(ivideoId : string) : Observable<IVideo> {
    return this.http.get<IResponse<IVideo>>(`${this.apiUrlIVideo}/${ivideoId}`).pipe(
      map<IResponse<IVideo>, IVideo>(res => res.data));
  }

  getTranscription(iVideo : IVideo) : Observable<any> {
    return this.http.get<any>(this.appConfigService.apiUrl + iVideo.transcriptionUrl);
  }

  // getTranscription(ivideoId: string) : Observable<any> {
  //   return this.http.get<IResponse<any>>(`${this.apiUrlIVideoSrtToJson}/${ivideoId}`).pipe(
  //     map<IResponse<IVideo>, IVideo>(res  => res.data));
  // }

  listIVideos() : Observable<IVideoList> {
    return this.http.get<IVideoList>(this.apiUrlIVideos).pipe(publishReplay(1), refCount());
  }


  save(ivideo : IVideo) : Observable<string> {
    return this.http.put<IResponse<string>>(this.apiUrlIVideo, ivideo).pipe(
      map<IResponse<string>, string>(result => result.data)  
    );
    
    /*.pipe(
      concatMap((result : IResponse<string>) => {
        if (isEmpty(result.data)) {
          throw new Error("Bad result.");
        }
        return this.http.put<IResponse<string>>(`${this.apiUrlIVideo}/${result.data}`, {});
      }), 
      concatMap((result : IResponse<string>) => {
        return this.http.get<IResponse<IVideo>>(`${this.apiUrlIVideo}/${result.data}`).pipe(
          map<IResponse<IVideo>, IVideo>( result => result.data)
        );
      })
    );*/
  }

}
