import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { MockedAppConnectService } from 'src/app/services/auth/appconnect-oauth.service.mock';
import { AppConnectService } from 'src/app/services/auth/appconnect-oauth.service';

@Component({
  selector: 'mnav-header',
  template: ``
})
class MnavHeaderTestDoubleComponent {} // Work around for not being able to auto mock StencilJS components : Mnav-Header

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavComponent, MnavHeaderTestDoubleComponent],
      providers: [
        { provide: AppConnectService, useClass: MockedAppConnectService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
