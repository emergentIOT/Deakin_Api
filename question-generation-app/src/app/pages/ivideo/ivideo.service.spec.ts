import { TestBed } from '@angular/core/testing';

import { IVideoService } from './ivideo.service';

describe('QuizService', () => {
  let service: IVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
