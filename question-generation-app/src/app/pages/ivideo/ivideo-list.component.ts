import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IVideoList } from 'src/app/interfaces/IVideoList';
import { IVideoService } from 'src/app/pages/ivideo/ivideo.service';
import { Router } from '@angular/router'; // CLI imports router

@Component({
  selector: 'app-ivideo-list',
  templateUrl: './ivideo-list.component.html',
  styleUrls: ['./ivideo-list.component.scss'], 
})
export class IVideoListComponent implements OnInit {
  
  public ivideoList: Observable<IVideoList>;

  constructor(private _ivideoService: IVideoService, private router: Router) {}

  ngOnInit() {
    this.ivideoList = this._ivideoService.listIVideos();
  }
}











