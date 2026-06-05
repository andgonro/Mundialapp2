import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { GameData, Match } from '../../models/game-data.model';
import { DataService } from '../../services/data.service';
import { GroupStandingsService } from '../../services/group-standings.service';
import { ScoringService } from '../../services/scoring.service';
import { PartidosComponent } from './partidos.component';

const MOCK_DATA: GameData = {
  players: [
    {
      id: 'IOKIN',
      teams: ['Canada', 'Inglaterra'],
      scorers: []
    },
    {
      id: 'PIWI',
      teams: ['Brasil', 'Mexico'],
      scorers: []
    }
  ],
  scorers_stats: {},
  matches: [
    {
      id: 1,
      stage: 'Group Stage',
      stage_label: 'Fase de Grupos',
      group: 'A',
      date: '2026-06-11',
      time: '18:00',
      home_team: 'Canadá',
      away_team: 'Brasil',
      home_score: 1,
      away_score: 0,
      stadium: 'Estadio 1',
      status: 'FINISHED'
    },
    {
      id: 2,
      stage: 'Group Stage',
      stage_label: 'Fase de Grupos',
      group: 'B',
      date: '2026-06-12',
      time: '18:00',
      home_team: 'Inglaterra',
      away_team: 'Mexico',
      home_score: null,
      away_score: null,
      stadium: 'Estadio 2',
      status: 'SCHEDULED'
    },
    {
      id: 3,
      stage: 'Round of 32',
      stage_label: 'Dieciseisavos de Final',
      group: null,
      date: '2026-06-29',
      time: '16:00',
      home_team: 'Canadá',
      away_team: '2B',
      home_score: null,
      away_score: null,
      stadium: 'Estadio 3',
      status: 'SCHEDULED'
    },
    {
      id: 4,
      stage: 'Round of 32',
      stage_label: 'Dieciseisavos de Final',
      group: null,
      date: '2026-06-30',
      time: '20:00',
      home_team: '1A',
      away_team: 'Brasil',
      home_score: null,
      away_score: null,
      stadium: 'Estadio 4',
      status: 'SCHEDULED'
    }
  ]
};

class DataServiceStub {
  getGameData() {
    return of(MOCK_DATA);
  }
}

describe('PartidosComponent', () => {
  let component: PartidosComponent;
  let fixture: ComponentFixture<PartidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartidosComponent],
      imports: [FormsModule],
      providers: [
        GroupStandingsService,
        ScoringService,
        { provide: DataService, useClass: DataServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should build participant filter options from players', () => {
    expect(component.playerOptions).toEqual(['TODOS', 'IOKIN', 'PIWI']);
  });

  it('should resolve owner id from team names with canonical matching', () => {
    expect(component.getTeamOwnerId('Canadá')).toBe('IOKIN');
    expect(component.getTeamOwnerId('Canada')).toBe('IOKIN');
    expect(component.getTeamOwnerId('W73')).toBeNull();
  });

  it('should combine group and participant filters for group stage matches', () => {
    component.selectedGroup = 'A';
    component.selectedPlayer = 'PIWI';

    const filtered = component.getMatchesForStage('Group Stage');

    expect(matchIds(filtered)).toEqual([1]);
  });

  it('should apply participant filter to knockout stages', () => {
    component.selectedGroup = 'A';
    component.selectedPlayer = 'PIWI';

    const filtered = component.getMatchesForStage('Round of 32');

    expect(matchIds(filtered)).toEqual([4]);
  });

  it('should render owner labels and participant filter in template', () => {
    component.expandedStages.add('Group Stage');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const playerFilter = host.querySelector('#player-filter');
    const ownerLabels = Array.from(host.querySelectorAll('.team-owner')).map((element) => element.textContent?.trim());

    expect(playerFilter).toBeTruthy();
    expect(ownerLabels).toContain('IOKIN');
    expect(ownerLabels).toContain('PIWI');
  });
});

function matchIds(matches: Match[]): number[] {
  return matches.map((match) => match.id);
}
