import { Component, OnInit } from '@angular/core';
import { AppConnectService } from '../../services/auth/appconnect-oauth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private appConnectService: AppConnectService) {}

  ngOnInit() {}

  get accessToken() {
    if (!this.appConnectService.hasValidAccessToken()) {
      return 'No Access Token Found';
    } else {
      return this.appConnectService.getAccessToken();
    }
  }
}
