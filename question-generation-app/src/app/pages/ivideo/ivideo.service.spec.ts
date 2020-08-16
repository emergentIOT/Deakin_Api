import { TestBed } from '@angular/core/testing';

import { IVideoService } from './ivideo.service';

describe('IVideoService', () => {
  let service: IVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('getIVideo', (done) => {
  //   service.getIVideo("001").subscribe( iVideo => {
  //     console.log("ivideo", iVideo);
  //     expect(iVideo).toBeDefined();
  //     done();
  //   });
  // });
});
