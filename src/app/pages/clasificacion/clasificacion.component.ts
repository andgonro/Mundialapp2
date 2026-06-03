import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerStanding } from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { ScoringService } from '../../services/scoring.service';

@Component({
  selector: 'app-clasificacion',
  templateUrl: './clasificacion.component.html',
  styleUrls: ['./clasificacion.component.css']
})
export class ClasificacionComponent implements OnInit, OnDestroy {
  standings: PlayerStanding[] = [];
  isLoading = true;
  errorMessage = '';

  private readonly expandedPlayers = new Set<string>();
  private dataSubscription?: Subscription;

  constructor(
    private readonly dataService: DataService,
    private readonly scoringService: ScoringService
  ) { }

  ngOnInit(): void {
    this.dataSubscription = this.dataService.getGameData().subscribe({
      next: (data) => {
        this.standings = this.scoringService.buildLeaderboard(data);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar los datos de la porra.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  toggleBreakdown(playerId: string): void {
    if (this.expandedPlayers.has(playerId)) {
      this.expandedPlayers.delete(playerId);
      return;
    }

    this.expandedPlayers.add(playerId);
  }

  isExpanded(playerId: string): boolean {
    return this.expandedPlayers.has(playerId);
  }

  trackByPlayerId(_: number, standing: PlayerStanding): string {
    return standing.playerId;
  }

}
