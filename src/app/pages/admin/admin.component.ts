import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GameData,
  GoalType,
  Match,
  MatchGoal,
  MatchSide,
  PlayerStanding
} from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { ScoringService } from '../../services/scoring.service';

interface PublishDataResponse {
  ok: boolean;
  message?: string;
}

interface GoalEntryView {
  index: number;
  goal: MatchGoal;
}

interface ProgressTarget {
  targetMatchId: number;
  targetSide: MatchSide;
  token: 'W' | 'RU';
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  readonly goalTypeOptions: Array<{ value: GoalType; label: string }> = [
    { value: 'regular', label: 'Gol en tiempo reglamentario' },
    { value: 'extra_time', label: 'Gol en prórroga' }
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
  matchWentToPenaltiesInput = false;
  matchPenaltyWinnerInput: MatchSide | '' = '';
  selectedMatchHomeTeam = '';
  selectedMatchAwayTeam = '';
  isSelectedKnockoutMatch = false;

  homeTeamScorers: string[] = [];
  awayTeamScorers: string[] = [];
  selectedHomeGoalScorer = '';
  selectedAwayGoalScorer = '';
  homeGoalTypeInput: GoalType = 'regular';
  awayGoalTypeInput: GoalType = 'regular';

  selectedScorerName = '';
  scorerGoalsInput = 0;
  showAdvancedScorerEditor = false;

  editorInfoMessage = '';
  editorErrorMessage = '';

  publishSecretInput = '';

  isBlobsPublishing = false;
  blobsPublishInfoMessage = '';
  blobsPublishErrorMessage = '';

  private dataSubscription?: Subscription;
  private originalData: GameData | null = null;
  private editableData: GameData | null = null;
  private directProgressionTargetsByMatchId = new Map<number, ProgressTarget[]>();

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
        this.directProgressionTargetsByMatchId = this.buildDirectProgressionTargets(data);
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

  trackByGoalIndex(_: number, goalEntry: GoalEntryView): number {
    return goalEntry.index;
  }

  onMatchSelectionChange(): void {
    this.clearEditorMessages();
    this.applySelectedMatchContext();
  }

  onPenaltiesToggleChange(): void {
    if (!this.matchWentToPenaltiesInput) {
      this.matchPenaltyWinnerInput = '';
    }
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

    if (homeScore === null && awayScore === null) {
      selectedMatch.home_score = null;
      selectedMatch.away_score = null;
      selectedMatch.status = 'SCHEDULED';
      selectedMatch.went_to_penalties = false;
      selectedMatch.penalty_winner_side = undefined;
      this.matchWentToPenaltiesInput = false;
      this.matchPenaltyWinnerInput = '';

      this.applyDirectKnockoutProgression(selectedMatch);
      this.recomputeDerivedViews();
      this.editorInfoMessage = `Partido #${selectedMatch.id} reiniciado a pendiente.`;
      return;
    }

    if (this.matchWentToPenaltiesInput && (homeScore === null || awayScore === null || homeScore !== awayScore)) {
      this.editorErrorMessage = 'Si fue a penaltis, el marcador de 120 minutos debe ser empate.';
      return;
    }

    if (this.matchWentToPenaltiesInput && !this.isSelectedKnockoutMatch) {
      this.editorErrorMessage = 'Los penaltis solo están permitidos en cruces eliminatorios.';
      return;
    }

    if (this.isSelectedKnockoutMatch && homeScore === awayScore && !this.matchWentToPenaltiesInput) {
      this.editorErrorMessage = 'En eliminatorias, un empate final requiere activar penaltis.';
      return;
    }

    if (this.matchWentToPenaltiesInput && !this.matchPenaltyWinnerInput) {
      this.editorErrorMessage = 'Selecciona el ganador en penaltis.';
      return;
    }

    selectedMatch.home_score = homeScore;
    selectedMatch.away_score = awayScore;
    selectedMatch.status = 'FINISHED';
    selectedMatch.went_to_penalties = this.matchWentToPenaltiesInput;
    selectedMatch.penalty_winner_side = this.matchWentToPenaltiesInput && this.matchPenaltyWinnerInput
      ? this.matchPenaltyWinnerInput
      : undefined;

    this.applyDirectKnockoutProgression(selectedMatch);
    this.recomputeDerivedViews();
    this.editorInfoMessage = `Partido #${selectedMatch.id} actualizado y marcado como finalizado.`;
  }

  addGoalForSelectedMatch(side: MatchSide): void {
    this.clearEditorMessages();

    const selectedMatch = this.getSelectedMatch();
    if (!selectedMatch) {
      this.editorErrorMessage = 'Selecciona un partido para registrar goles.';
      return;
    }

    const scorerName = side === 'home' ? this.selectedHomeGoalScorer : this.selectedAwayGoalScorer;
    const availableScorers = side === 'home' ? this.homeTeamScorers : this.awayTeamScorers;

    if (!scorerName || !availableScorers.includes(scorerName)) {
      this.editorErrorMessage = 'Selecciona un goleador válido para ese equipo.';
      return;
    }

    const goalType = side === 'home' ? this.homeGoalTypeInput : this.awayGoalTypeInput;
    selectedMatch.goals = selectedMatch.goals ?? [];
    selectedMatch.goals.push({ scorer: scorerName, type: goalType });

    this.syncScorerStatFromMatchGoals(scorerName);
    this.recomputeDerivedViews();
    this.editorInfoMessage = `Gol registrado para ${scorerName} en el partido #${selectedMatch.id}.`;
  }

  removeGoalFromSelectedMatch(goalIndex: number): void {
    this.clearEditorMessages();

    const selectedMatch = this.getSelectedMatch();
    const goals = selectedMatch?.goals;

    if (!selectedMatch || !goals || goalIndex < 0 || goalIndex >= goals.length) {
      this.editorErrorMessage = 'No se pudo eliminar el gol seleccionado.';
      return;
    }

    const removedGoal = goals.splice(goalIndex, 1)[0];
    this.syncScorerStatFromMatchGoals(removedGoal.scorer);
    this.recomputeDerivedViews();
    this.editorInfoMessage = 'Gol eliminado del partido seleccionado.';
  }

  getGoalsForSelectedMatchSide(side: MatchSide): GoalEntryView[] {
    const selectedMatch = this.getSelectedMatch();
    if (!selectedMatch || !this.editableData) {
      return [];
    }

    const sideTeam = side === 'home' ? selectedMatch.home_team : selectedMatch.away_team;
    const sideTeamKey = this.scoringService.canonicalizeTeamName(sideTeam);
    const goals = selectedMatch.goals ?? [];

    return goals
      .map((goal, index) => ({ goal, index }))
      .filter((entry) => {
        const scorerTeam = this.editableData?.scorers_stats[entry.goal.scorer]?.team;
        if (!scorerTeam) {
          return false;
        }

        return this.scoringService.canonicalizeTeamName(scorerTeam) === sideTeamKey;
      });
  }

  getGoalTypeLabel(goalType: GoalType): string {
    if (goalType === 'regular') {
      return 'Reglamentario';
    }

    if (goalType === 'extra_time') {
      return 'Prórroga';
    }

    if (goalType === 'own_goal') {
      return 'Autogol';
    }

    if (goalType === 'assist') {
      return 'Asistencia';
    }

    return 'Penaltis';
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

  toggleAdvancedScorerEditor(): void {
    this.showAdvancedScorerEditor = !this.showAdvancedScorerEditor;
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
    this.editorInfoMessage = 'Archivo descargado. Guárdalo como src/assets/data.json y aplica los cambios donde corresponda.';
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

  private syncScorerStatFromMatchGoals(scorerName: string): void {
    if (!this.editableData || !this.editableData.scorers_stats[scorerName]) {
      return;
    }

    let goals = 0;

    for (const match of this.editableData.matches) {
      for (const currentGoal of match.goals ?? []) {
        if (currentGoal.scorer !== scorerName) {
          continue;
        }

        if (currentGoal.type !== 'regular' && currentGoal.type !== 'extra_time') {
          continue;
        }

        goals += 1;
      }
    }

    this.editableData.scorers_stats[scorerName].goals = goals;
  }

  private applySelectedMatchContext(): void {
    const selectedMatch = this.getSelectedMatch();
    if (!selectedMatch) {
      this.matchHomeScoreInput = '';
      this.matchAwayScoreInput = '';
      this.matchWentToPenaltiesInput = false;
      this.matchPenaltyWinnerInput = '';
      this.selectedMatchHomeTeam = '';
      this.selectedMatchAwayTeam = '';
      this.isSelectedKnockoutMatch = false;
      this.homeTeamScorers = [];
      this.awayTeamScorers = [];
      this.selectedHomeGoalScorer = '';
      this.selectedAwayGoalScorer = '';
      return;
    }

    this.selectedMatchHomeTeam = selectedMatch.home_team;
    this.selectedMatchAwayTeam = selectedMatch.away_team;
    this.isSelectedKnockoutMatch = this.isKnockoutMatch(selectedMatch);
    this.matchHomeScoreInput = selectedMatch.home_score === null ? '' : String(selectedMatch.home_score);
    this.matchAwayScoreInput = selectedMatch.away_score === null ? '' : String(selectedMatch.away_score);
    this.matchWentToPenaltiesInput = !!selectedMatch.went_to_penalties;
    this.matchPenaltyWinnerInput = selectedMatch.penalty_winner_side ?? '';

    const previousHomeScorer = this.selectedHomeGoalScorer;
    const previousAwayScorer = this.selectedAwayGoalScorer;

    this.homeTeamScorers = this.buildTeamScorerOptions(selectedMatch.home_team);
    this.awayTeamScorers = this.buildTeamScorerOptions(selectedMatch.away_team);

    this.selectedHomeGoalScorer = this.homeTeamScorers.includes(previousHomeScorer)
      ? previousHomeScorer
      : (this.homeTeamScorers[0] ?? '');

    this.selectedAwayGoalScorer = this.awayTeamScorers.includes(previousAwayScorer)
      ? previousAwayScorer
      : (this.awayTeamScorers[0] ?? '');
  }

  private buildTeamScorerOptions(teamName: string): string[] {
    if (!this.editableData) {
      return [];
    }

    const teamKey = this.scoringService.canonicalizeTeamName(teamName);

    return Object.entries(this.editableData.scorers_stats)
      .filter(([_, scorerStat]) => this.scoringService.canonicalizeTeamName(scorerStat.team) === teamKey)
      .map(([scorerName]) => scorerName)
      .sort((left, right) => left.localeCompare(right, 'es'));
  }

  private isKnockoutMatch(match: Match): boolean {
    return match.group === null;
  }

  private parseProgressToken(rawTeamName: string): { token: 'W' | 'RU'; sourceMatchId: number } | null {
    const normalized = rawTeamName.trim().toUpperCase();
    const winnerMatch = /^W(\d+)$/.exec(normalized);
    if (winnerMatch) {
      return {
        token: 'W',
        sourceMatchId: Number(winnerMatch[1])
      };
    }

    const runnerUpMatch = /^RU(\d+)$/.exec(normalized);
    if (runnerUpMatch) {
      return {
        token: 'RU',
        sourceMatchId: Number(runnerUpMatch[1])
      };
    }

    return null;
  }

  private buildDirectProgressionTargets(data: GameData): Map<number, ProgressTarget[]> {
    const targetsByMatch = new Map<number, ProgressTarget[]>();

    data.matches.forEach((match) => {
      (['home', 'away'] as MatchSide[]).forEach((side) => {
        const teamReference = side === 'home' ? match.home_team : match.away_team;
        const parsedToken = this.parseProgressToken(teamReference);
        if (!parsedToken) {
          return;
        }

        const targets = targetsByMatch.get(parsedToken.sourceMatchId) ?? [];
        targets.push({
          targetMatchId: match.id,
          targetSide: side,
          token: parsedToken.token
        });
        targetsByMatch.set(parsedToken.sourceMatchId, targets);
      });
    });

    return targetsByMatch;
  }

  private setTeamOnMatchSide(match: Match, side: MatchSide, teamName: string): void {
    if (side === 'home') {
      match.home_team = teamName;
      return;
    }

    match.away_team = teamName;
  }

  private getResolvedTeamForToken(sourceMatch: Match, token: 'W' | 'RU'): string | null {
    const winnerSide = this.scoringService.resolveMatchWinnerSide(sourceMatch);
    if (!winnerSide) {
      return null;
    }

    if (token === 'W') {
      return winnerSide === 'home' ? sourceMatch.home_team : sourceMatch.away_team;
    }

    return winnerSide === 'home' ? sourceMatch.away_team : sourceMatch.home_team;
  }

  private applyDirectKnockoutProgression(sourceMatch: Match): void {
    if (!this.editableData) {
      return;
    }

    const targets = this.directProgressionTargetsByMatchId.get(sourceMatch.id) ?? [];
    if (targets.length === 0) {
      return;
    }

    targets.forEach((target) => {
      const targetMatch = this.editableData?.matches.find((match) => match.id === target.targetMatchId);
      if (!targetMatch) {
        return;
      }

      const resolvedTeam = this.getResolvedTeamForToken(sourceMatch, target.token);
      const placeholder = `${target.token}${sourceMatch.id}`;
      this.setTeamOnMatchSide(targetMatch, target.targetSide, resolvedTeam ?? placeholder);
    });
  }

  private recomputeDerivedViews(): void {
    if (!this.editableData) {
      this.pendingMatches = [];
      this.standings = [];
      this.allMatches = [];
      this.allScorers = [];
      this.applySelectedMatchContext();
      return;
    }

    this.pendingMatches = this.editableData.matches
      .filter((match) => match.status !== 'FINISHED')
      .sort((a, b) => a.id - b.id);

    this.allMatches = [...this.editableData.matches].sort((a, b) => a.id - b.id);
    this.allScorers = Object.keys(this.editableData.scorers_stats)
      .sort((left, right) => left.localeCompare(right, 'es'));

    this.standings = this.scoringService.buildLeaderboard(this.editableData);
    this.applySelectedMatchContext();
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

  private clearBlobsPublishMessages(): void {
    this.blobsPublishInfoMessage = '';
    this.blobsPublishErrorMessage = '';
  }

  private cloneData(data: GameData): GameData {
    return JSON.parse(JSON.stringify(data)) as GameData;
  }

}
