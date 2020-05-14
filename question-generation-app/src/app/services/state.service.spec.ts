import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';

describe('StateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StateService = TestBed.get(StateService);
    expect(service).toBeTruthy();
  });

  it('can GET data', () => {
    const service: StateService = TestBed.get(StateService);
    expect(service.getValue('username')).toEqual('tedeaki');
  });

  it('can GET empty data', () => {
    const service: StateService = TestBed.get(StateService);
    expect(service.getValue('user')).toEqual('');
  });
});
