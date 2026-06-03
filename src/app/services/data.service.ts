import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { GameData } from '../models/game-data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly gameData$: Observable<GameData> = this.http
    .get<GameData>('assets/data.json')
    .pipe(shareReplay(1));

  constructor(private readonly http: HttpClient) { }

  getGameData(): Observable<GameData> {
    return this.gameData$;
  }
}
