import { Component, OnInit, Input } from '@angular/core';
// import { Observable } from 'rxjs';
// import { PersonService } from '../../../services/person.service';
import { IPerson } from '../../../interfaces/iPerson';

@Component({
  selector: 'app-welcome-panel',
  templateUrl: './welcome-panel.component.html',
  styleUrls: ['./welcome-panel.component.scss']
})
export class WelcomePanelComponent implements OnInit {
  @Input()
  person: IPerson;

  constructor() {}

  get displayName(): string {
    return `${
      this.person.preferredName !== ''
        ? this.person.preferredName
        : this.person.givenNames
    } ${this.person.lastName}`;
  }

  ngOnInit() {}
}
