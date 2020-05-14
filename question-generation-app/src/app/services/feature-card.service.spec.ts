import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { FeatureCardService } from './feature-card.service';
import { IFeatureCard } from '../interfaces/iFeatureCard';

describe('FeatureCardService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: FeatureCardService = TestBed.get(FeatureCardService);
    expect(service).toBeTruthy();
  });

  it('can GET data', () => {
    const testData: IFeatureCard[] = [
      {
        imageUrl:
          '//blogs-dev.deakin.edu.au/wp-content/uploads/2017/07/140436_signage_night_044.jpg',
        heading: 'Card one',
        content: 'Contents'
      }
    ];
    httpClient
      .get<IFeatureCard[]>('./unit.service.mock.json')
      .subscribe((data) => expect(data).toEqual(testData));
  });
});
