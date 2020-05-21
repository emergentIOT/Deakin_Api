import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FeatureCardService } from '../../../services/feature-card.service';
import { IFeatureCard } from '../../../interfaces/iFeatureCard';

@Component({
  selector: 'app-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  adCards: Observable<IFeatureCard[]>;

  constructor(private _featureCardService: FeatureCardService) {}

  ngOnInit() {
    this.adCards = this._featureCardService.getCards();
  }

  newQuiz() {
    console.log('new quiz');
  }
}
