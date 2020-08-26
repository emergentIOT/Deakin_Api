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

  private apiUrlIVideos = this.appConfigService.apiUrl + '/mock-data/ivideo/ivideo-list.json';
  private qnaBotUrl = 'https://des-inno-qnabot.its.deakin.edu.au';
  
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  getSearchAnswer( data: string) : Observable<any>{
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const responseType = 'text' as 'json';
    const options = {headers, responseType};
    
    return  this.http.post<any>(this.qnaBotUrl, data, options);
  }


  getIVideo(videoId : string) : Observable<IVideo> {
    return this.listIVideos().pipe(map<IVideoList, IVideo>( iVideoList => {
      return iVideoList.data.find(iVideo => iVideo._id === videoId);
    }));
  }

  getTranscription(iVideo : IVideo) : Observable<any> {
    return this.http.get<any>(this.appConfigService.apiUrl + iVideo.transcriptionUrl);
  }

  listIVideos() : Observable<IVideoList> {
    return this.http.get<IVideoList>(this.apiUrlIVideos).pipe(publishReplay(1), refCount());
  }


  // saveAndGenerate(ivideo : IVideoUpdate) : Observable<IVideo> {
  //   return this.http.put<IResponse<string>>(this.apiUrlIVideo, ivideo).pipe(
  //     concatMap((result : IResponse<string>) => {
  //       if (isEmpty(result.data)) {
  //         throw new Error("Bad result.");
  //       }
  //       return this.http.put<IResponse<string>>(`${this.apiUrlQG}/${result.data}`, {});
  //     }), 
  //     concatMap((result : IResponse<string>) => {
  //       return this.http.get<IResponse<IVideo>>(`${this.apiUrlIVideo}/${result.data}`).pipe(
  //         map<IResponse<IVideo>, IVideo>( result => result.data)
  //       );
  //     })
  //   );
  // }

}
