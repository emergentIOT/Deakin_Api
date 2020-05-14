import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IFeatureCard } from '../interfaces/iFeatureCard';

@Injectable({
  providedIn: 'root'
})
export class FeatureCardService {
  private endpoint = 'assets/mock-data/feature-card.mock.json';

  constructor(private http: HttpClient) {}

  getCards() {
    return this.http.get<IFeatureCard[]>(this.endpoint);
  }
}
