import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameData, Match, MatchStatus, PlayerStanding } from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { ScoringService } from '../../services/scoring.service';

interface PublishDataResponse {
  ok: boolean;
  message?: string;
  commitUrl?: string;
  commitSha?: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  readonly statusOptions: Array<{ value: MatchStatus; label: string }> = [
    { value: 'SCHEDULED', label: 'Programado' },
    { value: 'IN_PLAY', label: 'En juego' },
    { value: 'FINISHED', label: 'Finalizado' }
  ];

  isLoading = true;
  loadError = '';

  isAuthenticated = false;
  isCheckingPassword = false;
  passwordInput = '';
  authError = '';

  pendingMatches: Match[] = [];
  standings: PlayerStanding[] = [];
  allMatches: Match[] = [];
  allScorers: string[] = [];

  selectedMatchId: number | null = null;
  matchHomeScoreInput = '';
  matchAwayScoreInput = '';
  matchStatusInput: MatchStatus = 'SCHEDULED';
  matchWentToPenaltiesInput = false;

  selectedScorerName = '';
  scorerGoalsInput = 0;

  editorInfoMessage = '';
  editorErrorMessage = '';

  publishSecretInput = '';
  commitMessageInput = 'actualiza resultados';
  isPublishingToGitHub = false;
  publishInfoMessage = '';
  publishErrorMessage = '';
  publishResultUrl = '';
  publishResultSha = '';

  isBlobsPublishing = false;
  blobsPublishInfoMessage = '';
  blobsPublishErrorMessage = '';

  private dataSubscription?: Subscription;
  private originalData: GameData | null = null;
  private editableData: GameData | null = null;

  constructor(
    private readonly dataService: DataService,
    private readonly scoringService: ScoringService,
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.dataSubscription = this.dataService.getGameData().subscribe({
      next: (data) => {
        this.originalData = this.cloneData(data);
        this.editableData = this.cloneData(data);
        this.recomputeDerivedViews();
        this.initializeEditorDefaults();
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

  trackByScorerName(_: number, scorerName: string): string {
    return scorerName;
  }

  onMatchSelectionChange(): void {
    this.clearEditorMessages();

    const selectedMatch = this.getSelectedMatch();
    if (!selectedMatch) {
      this.matchHomeScoreInput = '';
      this.matchAwayScoreInput = '';
      this.matchStatusInput = 'SCHEDULED';
      this.matchWentToPenaltiesInput = false;
      return;
    }

    this.matchHomeScoreInput = selectedMatch.home_score === null ? '' : String(selectedMatch.home_score);
    this.matchAwayScoreInput = selectedMatch.away_score === null ? '' : String(selectedMatch.away_score);
    this.matchStatusInput = selectedMatch.status;
    this.matchWentToPenaltiesInput = !!selectedMatch.went_to_penalties;
  }

  onScorerSelectionChange(): void {
    this.clearEditorMessages();

    if (!this.editableData || !this.selectedScorerName) {
      this.scorerGoalsInput = 0;
      return;
    }

    const scorerStat = this.editableData.scorers_stats[this.selectedScorerName];
    this.scorerGoalsInput = scorerStat ? scorerStat.goals : 0;
  }

  applyMatchUpdate(): void {
    this.clearEditorMessages();

    const selectedMatch = this.getSelectedMatch();
    if (!selectedMatch) {
      this.editorErrorMessage = 'Selecciona un partido para actualizar.';
      return;
    }

    let homeScore: number | null;
    let awayScore: number | null;

    try {
      homeScore = this.parseScoreInput(this.matchHomeScoreInput);
      awayScore = this.parseScoreInput(this.matchAwayScoreInput);
    } catch (error) {
      this.editorErrorMessage = error instanceof Error ? error.message : 'Marcador no válido.';
      return;
    }

    if ((homeScore === null) !== (awayScore === null)) {
      this.editorErrorMessage = 'Debes completar ambos marcadores o dejar ambos vacíos.';
      return;
    }

    if (this.matchStatusInput === 'FINISHED' && (homeScore === null || awayScore === null)) {
      this.editorErrorMessage = 'Un partido finalizado necesita marcador completo.';
      return;
    }

    if (this.matchStatusInput === 'SCHEDULED' && (homeScore !== null || awayScore !== null)) {
      this.editorErrorMessage = 'Un partido programado no debe tener marcador.';
      return;
    }

    if (this.matchWentToPenaltiesInput && (homeScore === null || awayScore === null || homeScore !== awayScore)) {
      this.editorErrorMessage = 'Si fue a penaltis, el marcador de 120 minutos debe ser empate.';
      return;
    }

    selectedMatch.home_score = homeScore;
    selectedMatch.away_score = awayScore;
    selectedMatch.status = this.matchStatusInput;
    selectedMatch.went_to_penalties = this.matchWentToPenaltiesInput;

    this.recomputeDerivedViews();
    this.editorInfoMessage = `Partido #${selectedMatch.id} actualizado en memoria.`;
  }

  applyScorerUpdate(): void {
    this.clearEditorMessages();

    if (!this.editableData) {
      this.editorErrorMessage = 'No hay datos cargados para editar.';
      return;
    }

    if (!this.selectedScorerName) {
      this.editorErrorMessage = 'Selecciona un goleador.';
      return;
    }

    const goals = Number(this.scorerGoalsInput);
    if (!Number.isInteger(goals) || goals < 0) {
      this.editorErrorMessage = 'Los goles deben ser un entero mayor o igual que 0.';
      return;
    }

    const scorerStat = this.editableData.scorers_stats[this.selectedScorerName];
    if (!scorerStat) {
      this.editorErrorMessage = 'No se encontró el goleador seleccionado en data.json.';
      return;
    }

    scorerStat.goals = goals;
    this.recomputeDerivedViews();
    this.editorInfoMessage = `Goles actualizados para ${this.selectedScorerName}.`;
  }

  resetEditorChanges(): void {
    if (!this.originalData) {
      return;
    }

    this.editableData = this.cloneData(this.originalData);
    this.recomputeDerivedViews();
    this.initializeEditorDefaults();
    this.editorInfoMessage = 'Se han reiniciado los cambios locales del editor.';
    this.editorErrorMessage = '';
  }

  downloadUpdatedData(): void {
    this.clearEditorMessages();

    if (!this.editableData) {
      this.editorErrorMessage = 'No hay datos para exportar.';
      return;
    }

    const dataJson = JSON.stringify(this.editableData, null, 2) + '\n';
    const blob = new Blob([dataJson], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    const dayStamp = new Date().toISOString().slice(0, 10);
    anchor.href = fileUrl;
    anchor.download = `data-${dayStamp}.json`;
    anchor.click();

    URL.revokeObjectURL(fileUrl);
    this.editorInfoMessage = 'Archivo descargado. Súbelo al repo como src/assets/data.json y haz commit.';
  }

  publishUpdatedDataToGitHub(): void {
    this.clearPublishMessages();

    if (!this.editableData) {
      this.publishErrorMessage = 'No hay datos para publicar.';
      return;
    }

    const adminSecret = this.publishSecretInput.trim();
    if (!adminSecret) {
      this.publishErrorMessage = 'Introduce la clave de publicación.';
      return;
    }

    const commitMessage = this.commitMessageInput.trim() || 'actualiza resultados';
    this.isPublishingToGitHub = true;

    this.http.post<PublishDataResponse>(
      '/.netlify/functions/publish-data',
      {
        updatedData: this.editableData,
        commitMessage
      },
      {
        headers: {
          'x-admin-secret': adminSecret
        }
      }
    ).subscribe({
      next: (response) => {
        this.isPublishingToGitHub = false;
        this.publishInfoMessage = response.message || 'Publicación completada.';
        this.publishResultUrl = response.commitUrl || '';
        this.publishResultSha = response.commitSha || '';
        this.publishSecretInput = '';
      },
      error: (error: HttpErrorResponse) => {
        this.isPublishingToGitHub = false;
        const payload = error.error as { message?: unknown } | null;
        const backendMessage = payload && typeof payload.message === 'string'
          ? payload.message
          : '';

        this.publishErrorMessage = backendMessage || 'No se pudo publicar en GitHub.';
      }
    });
  }

  publishUpdatedDataToBlobs(): void {
    this.clearBlobsPublishMessages();

    if (!this.editableData) {
      this.blobsPublishErrorMessage = 'No hay datos para publicar.';
      return;
    }

    const adminSecret = this.publishSecretInput.trim();
    if (!adminSecret) {
      this.blobsPublishErrorMessage = 'Introduce la clave de publicación.';
      return;
    }

    this.isBlobsPublishing = true;

    this.http.post<PublishDataResponse>(
      '/.netlify/functions/publish-data-blobs',
      { updatedData: this.editableData },
      { headers: { 'x-admin-secret': adminSecret } }
    ).subscribe({
      next: (response) => {
        this.isBlobsPublishing = false;
        this.blobsPublishInfoMessage = response.message || 'Guardado en Blobs.';
        this.publishSecretInput = '';
      },
      error: (error: HttpErrorResponse) => {
        this.isBlobsPublishing = false;
        const payload = error.error as { message?: unknown } | null;
        const backendMessage = payload && typeof payload.message === 'string'
          ? payload.message : '';
        this.blobsPublishErrorMessage = backendMessage || 'No se pudo guardar en Blobs.';
      }
    });
  }

  private async hashValue(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((currentByte) => currentByte.toString(16).padStart(2, '0')).join('');
  }

  private recomputeDerivedViews(): void {
    if (!this.editableData) {
      this.pendingMatches = [];
      this.standings = [];
      this.allMatches = [];
      this.allScorers = [];
      return;
    }

    this.pendingMatches = this.editableData.matches
      .filter((match) => match.status !== 'FINISHED')
      .sort((a, b) => a.id - b.id);

    this.allMatches = [...this.editableData.matches].sort((a, b) => a.id - b.id);
    this.allScorers = Object.keys(this.editableData.scorers_stats)
      .sort((left, right) => left.localeCompare(right, 'es'));

    this.standings = this.scoringService.buildLeaderboard(this.editableData);
  }

  private initializeEditorDefaults(): void {
    const preferredMatch = this.pendingMatches[0] ?? this.allMatches[0];
    this.selectedMatchId = preferredMatch ? preferredMatch.id : null;
    this.onMatchSelectionChange();

    this.selectedScorerName = this.allScorers[0] ?? '';
    this.onScorerSelectionChange();
  }

  private parseScoreInput(rawValue: string): number | null {
    const trimmed = rawValue.trim();

    if (!trimmed) {
      return null;
    }

    const score = Number(trimmed);
    if (!Number.isInteger(score) || score < 0) {
      throw new Error('El marcador debe ser un entero mayor o igual que 0.');
    }

    return score;
  }

  private getSelectedMatch(): Match | null {
    if (!this.editableData || this.selectedMatchId === null) {
      return null;
    }

    return this.editableData.matches.find((match) => match.id === this.selectedMatchId) ?? null;
  }

  private clearEditorMessages(): void {
    this.editorInfoMessage = '';
    this.editorErrorMessage = '';
  }

  private clearPublishMessages(): void {
    this.publishInfoMessage = '';
    this.publishErrorMessage = '';
    this.publishResultUrl = '';
    this.publishResultSha = '';
  }

  private clearBlobsPublishMessages(): void {
    this.blobsPublishInfoMessage = '';
    this.blobsPublishErrorMessage = '';
  }

  private cloneData(data: GameData): GameData {
    return JSON.parse(JSON.stringify(data)) as GameData;
  }

}
