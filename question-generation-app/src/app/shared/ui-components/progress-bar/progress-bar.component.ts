import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {
  @Input()
  set min(min: number) {
    this._min = min;
  }

  get min() {
    return this._min;
  }

  @Input()
  set max(max: number) {
    this._max = max;
  }

  get max() {
    return this._max;
  }

  @Input()
  set value(value: number) {
    this._value = value;
    const range = this.max - this.min; // Is 'undefined' if either is unset
    if (range > 0) {
      const percentage = (this._value / range) * 100;
      this._barWidth = `${percentage}%`;
    }
  }
  get value() {
    return this._value;
  }

  @Input()
  message: string;

  private _min: number;
  private _max: number;
  private _value: number;
  private _barWidth: string;

  isIndeterminate(): boolean {
    /**
     * Method for checking if the progress bar is in an
     * indeterminate state. This will be the case if any
     * of the inputs are considerded to be invalid. For the
     * purposes of this method, an input is valid if it is
     * either truthy or zero. Therefore, if any of the inputs
     * aren't bound to a value in the parent component, it will
     * be indeterminate.
     */

    const minValid: boolean = !!this.min || this.min === 0;
    const maxValid: boolean = !!this.max || this.max === 0;
    const valueValid: boolean = !!this.value || this.value === 0;

    return !(minValid && maxValid && valueValid);
  }

  /**
   * Can't bind directly to CSS custom properties
   * https://medium.com/@ingobrk/using-css-variables-in-angular-282a9edf1a20
   */
  @HostBinding('attr.style')
  public get valueAsStyle(): any {
    return this.sanitizer.bypassSecurityTrustStyle(
      `--bar-width: ${this._barWidth}`
    );
  }

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {}
}
