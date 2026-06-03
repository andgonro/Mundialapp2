import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  PlayerStanding,
  ScorerRankingItem,
  TeamPerformanceItem
} from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { ScoringService } from '../../services/scoring.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage = '';

  pichichiRows: ScorerRankingItem[] = [];
  teamRows: TeamPerformanceItem[] = [];
  playerRows: PlayerStanding[] = [];

  private dataSubscription?: Subscription;

  constructor(
    private readonly dataService: DataService,
    private readonly scoringService: ScoringService
  ) { }

  ngOnInit(): void {
    this.dataSubscription = this.dataService.getGameData().subscribe({
      next: (data) => {
        this.pichichiRows = this.scoringService.buildPichichi(data);
        this.teamRows = this.scoringService.buildTeamPerformance(data);
        this.playerRows = this.scoringService.buildLeaderboard(data);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar las estadísticas.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  trackByScorer(_: number, row: ScorerRankingItem): string {
    return row.scorer;
  }

  trackByTeam(_: number, row: TeamPerformanceItem): string {
    return row.team;
  }

  trackByPlayer(_: number, row: PlayerStanding): string {
    return row.playerId;
  }

}
