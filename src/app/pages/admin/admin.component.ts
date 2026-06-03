import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Match, PlayerStanding } from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { ScoringService } from '../../services/scoring.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  isLoading = true;
  loadError = '';

  isAuthenticated = false;
  isCheckingPassword = false;
  passwordInput = '';
  authError = '';

  pendingMatches: Match[] = [];
  standings: PlayerStanding[] = [];

  private dataSubscription?: Subscription;

  constructor(
    private readonly dataService: DataService,
    private readonly scoringService: ScoringService
  ) { }

  ngOnInit(): void {
    this.dataSubscription = this.dataService.getGameData().subscribe({
      next: (data) => {
        this.pendingMatches = data.matches
          .filter((match) => match.status !== 'FINISHED')
          .sort((a, b) => a.id - b.id);

        this.standings = this.scoringService.buildLeaderboard(data);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Error al cargar los datos de administración.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  async unlockAdmin(): Promise<void> {
    this.authError = '';

    if (!this.passwordInput.trim()) {
      this.authError = 'Introduce la contraseña para continuar.';
      return;
    }

    this.isCheckingPassword = true;

    try {
      const providedHash = await this.hashValue(this.passwordInput.trim());

      if (providedHash === environment.adminPasswordHash) {
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
        this.authError = 'Contraseña incorrecta.';
      }
    } finally {
      this.passwordInput = '';
      this.isCheckingPassword = false;
    }
  }

  formatScore(match: Match): string {
    if (match.home_score === null || match.away_score === null) {
      return '–';
    }

    return `${match.home_score} - ${match.away_score}`;
  }

  trackByMatchId(_: number, match: Match): number {
    return match.id;
  }

  trackByPlayer(_: number, player: PlayerStanding): string {
    return player.playerId;
  }

  private async hashValue(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((currentByte) => currentByte.toString(16).padStart(2, '0')).join('');
  }

}
