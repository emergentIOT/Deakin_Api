import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonService } from '../../services/person.service';
import { IPerson } from '../../interfaces/iPerson';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  person$: Observable<IPerson>;

  constructor(private _personService: PersonService) {}

  ngOnInit() {
    this.person$ = this._personService.getPerson();
  }
}
