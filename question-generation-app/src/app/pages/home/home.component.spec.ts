import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { HomeComponent } from './home.component';
import { WelcomePanelComponent } from './welcome-panel/welcome-panel.component';
import { PersonService } from '../../services/person.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj('PersonService', ['getPerson']);

    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        MockComponent(WelcomePanelComponent),
      ],
      providers: [{ provide: PersonService, useValue: spy }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
