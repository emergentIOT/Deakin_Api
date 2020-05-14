import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.scss']
})
export class OtherComponent implements OnInit {
  todoData = [
    {
      userId: 1,
      id: 1,
      title: 'delectus aut autem',
      completed: true
    },
    {
      userId: 1,
      id: 2,
      title: 'quis ut nam facilis et officia qui',
      completed: false
    }
  ];

  constructor() {}

  ngOnInit() {}
}
