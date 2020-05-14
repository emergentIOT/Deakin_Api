import { Component, OnInit } from '@angular/core';
import { AppConnectService } from '../../../services/auth/appconnect-oauth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  constructor(private appConnectService: AppConnectService) {}

  ngOnInit() {}

  login() {
    this.appConnectService.initLoginFlow();
  }

  logout() {
    this.appConnectService.logOut();
  }

  get isLoggedIn() {
    return this.appConnectService.hasValidAccessToken();
  }
}
