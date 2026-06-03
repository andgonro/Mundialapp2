import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameData, GroupStandingRow, Match } from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { GroupStandingsService } from '../../services/group-standings.service';

@Component({
  selector: 'app-partidos',
  templateUrl: './partidos.component.html',
  styleUrls: ['./partidos.component.css']
})
export class PartidosComponent implements OnInit, OnDestroy {
  readonly stageOrder: string[] = [
    'Group Stage',
    'Round of 32',
    'Round of 16',
    'Quarter-finals',
    'Semi-finals',
    'Third Place Play-off',
    'Final'
  ];

  readonly stageLabels: Record<string, string> = {
    'Group Stage': 'Fase de grupos',
    'Round of 32': 'Dieciseisavos de final',
    'Round of 16': 'Octavos de final',
    'Quarter-finals': 'Cuartos de final',
    'Semi-finals': 'Semifinales',
    'Third Place Play-off': 'Tercer puesto',
    'Final': 'Final'
  };

  readonly groupOptions = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  isLoading = true;
  errorMessage = '';
  selectedGroup = 'TODOS';
  matchesByStage: Record<string, Match[]> = {};
  groupStandings: Record<string, GroupStandingRow[]> = {};

  private dataSubscription?: Subscription;

  constructor(
    private readonly dataService: DataService,
    private readonly groupStandingsService: GroupStandingsService
  ) { }

  ngOnInit(): void {
    this.dataSubscription = this.dataService.getGameData().subscribe({
      next: (data) => {
        this.matchesByStage = this.groupMatchesByStage(data);
        this.groupStandings = this.groupStandingsService.buildGroupStandings(data.matches);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar el calendario de partidos.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  getMatchesForStage(stage: string): Match[] {
    const baseMatches = this.matchesByStage[stage] ?? [];

    if (stage !== 'Group Stage' || this.selectedGroup === 'TODOS') {
      return baseMatches;
    }

    return baseMatches.filter((match) => match.group === this.selectedGroup);
  }

  stageHeading(stage: string): string {
    return this.stageLabels[stage] ?? stage;
  }

  stageTag(match: Match): string {
    if (match.stage === 'Group Stage' && match.group) {
      return `Grupo ${match.group}`;
    }

    return this.stageHeading(match.stage);
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

  trackByGroup(_: number, group: string): string {
    return group;
  }

  getStandingsForGroup(group: string): GroupStandingRow[] {
    return this.groupStandings[group] ?? [];
  }

  get groupsToShow(): string[] {
    if (this.selectedGroup === 'TODOS') {
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    }
    return [this.selectedGroup];
  }

  private groupMatchesByStage(data: GameData): Record<string, Match[]> {
    const grouped: Record<string, Match[]> = {};

    for (const stage of this.stageOrder) {
      grouped[stage] = [];
    }

    for (const match of data.matches) {
      if (!grouped[match.stage]) {
        grouped[match.stage] = [];
      }
      grouped[match.stage].push(match);
    }

    for (const stage of Object.keys(grouped)) {
      grouped[stage] = grouped[stage].sort((a, b) => a.id - b.id);
    }

    return grouped;
  }

}
