import { Component, OnInit, Input } from '@angular/core';
import { PersonService } from '../../../services/person.service';
import { Observable } from 'rxjs';
import { IPerson } from '../../../interfaces/iPerson';

@Component({
  selector: 'app-welcome-panel',
  templateUrl: './welcome-panel.component.html',
  styleUrls: ['./welcome-panel.component.scss']
})
export class WelcomePanelComponent implements OnInit {
  
  person: IPerson;

  constructor(private _personService: PersonService) {}

  get displayName(): string {
    if (!this.person) {
      return "";
    }
    return `${
          this.person.preferredName !== ''
        ? this.person.preferredName
        : this.person.givenNames
    } ${this.person.lastName}`;
  }

  ngOnInit() {
    this._personService.getPerson().subscribe(person => this.person = person);
    console.log("person", this.person)
  }
}
