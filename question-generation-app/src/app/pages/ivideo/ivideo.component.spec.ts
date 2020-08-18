import { TestBed, async } from '@angular/core/testing';
import { IVideoComponent } from './ivideo.component';

describe('IVideoComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
         IVideoComponent
      ],
    }).compileComponents();
  }));

  it('should create the  IVideo', () => {
    const fixture = TestBed.createComponent(IVideoComponent);
    const ivideo = fixture.componentInstance;
    expect( ivideo).toBeTruthy();
  });

  it(`should have as title 'VideoNavigation'`, () => {
    const fixture = TestBed.createComponent(IVideoComponent);
    const ivideo = fixture.componentInstance;
    expect( ivideo.title).toEqual('VideoNavigation');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(IVideoComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('VideoNavigation  IVideo is running!');
  });
});
