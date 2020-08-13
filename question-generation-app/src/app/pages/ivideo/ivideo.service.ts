import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IVideoList } from "../../interfaces/IVideoList";
import { AppConfigService } from '../../services/app-config/app-config.service';
import { publishReplay, refCount, catchError, concatMap, map } from 'rxjs/operators';
import { handleError } from '../../shared/data/util-http';
import { IResponse } from '../../interfaces/iResponse';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { isEmpty } from 'npm-stringutils';

@Injectable({
  providedIn: 'root'
})
export class IVideoService {

  private CHECK_FOR_QUIZ_INTERVAL_SECONDS = 3;

  private apiUrlIVideos = '';//this.appConfigService.apiUrl + '/api/v1/iv/ivideos';


  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  listIVideos() : Observable<IVideoList> {
    return this.http.get<IVideoList>('assets/mock-data/ivideo/ivideo-list.json');
    // return this.http.get<IVideoList>(this.apiUrlIVideos).pipe(publishReplay(1), refCount());
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
