import { Injectable } from '@angular/core';

/**
 * Temporary state service, to help keep config clean.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor() {}

  public getValue(key: String) {
    const returnValue = key === 'username' ? 'tedeaki' : '';
    return returnValue;
  }
}
