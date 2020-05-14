import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../app-config/app-config.service';

export abstract class ServerService<Model> {
  constructor(
    public apiEndpoint: string,
    protected http: HttpClient,
    protected appConfig: AppConfigService
  ) {}

  get(): Observable<Model> {
    return this.http.get<Model>(this.getURL());
  }

  post(entity: Model): Observable<any> {
    return this.http.post<Model>(this.getURL(), entity);
  }

  delete(id: string | number): Observable<any> {
    throw new Error(
      `Method "delete" not implemented for entity ${this.apiEndpoint}.`
    );
  }

  protected getURL() {
    return `${this.appConfig.apiUrl}${this.apiEndpoint}`;
  }
}
