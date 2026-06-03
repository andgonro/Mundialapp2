import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GameData } from '../models/game-data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly gameData$: Observable<GameData>;

  constructor(private readonly http: HttpClient) {
    this.gameData$ = environment.blobsBackend
      ? this.http.get<GameData>('/.netlify/functions/get-data').pipe(
          tap(() => {
            console.info('[DataService] Game data loaded from Netlify Blobs');
          }),
          catchError((error) => {
            console.warn('[DataService] Netlify Blobs read failed, falling back to assets/data.json', error);
            return this.http.get<GameData>('assets/data.json');
          }),
          shareReplay(1)
        )
      : this.http.get<GameData>('assets/data.json').pipe(shareReplay(1));
  }

  getGameData(): Observable<GameData> {
    return this.gameData$;
  }
}
