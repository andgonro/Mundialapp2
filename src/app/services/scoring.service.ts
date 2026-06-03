import { Injectable } from '@angular/core';
import {
  GameData,
  Match,
  MatchSide,
  PlayerAssignment,
  PlayerStanding,
  ScorerPointsBreakdown,
  ScorerRankingItem,
  TeamPerformanceItem
} from '../models/game-data.model';

@Injectable({
  providedIn: 'root'
})
export class ScoringService {
  private readonly excludedTeams = new Set<string>([
    'haiti',
    'curacao',
    'new zealand',
    'cabo verde',
    'iraq',
    'jordan',
    'uzbekistan',
    'panama'
  ]);

  private readonly teamAliases: Record<string, string> = {
    'mexico': 'mexico',
    'south africa': 'south africa',
    'sudafrica': 'south africa',
    'south korea': 'south korea',
    'corea del sur': 'south korea',
    'czechia': 'czechia',
    'chequia': 'czechia',
    'canada': 'canada',
    'switzerland': 'switzerland',
    'suiza': 'switzerland',
    'qatar': 'qatar',
    'catar': 'qatar',
    'bosnia and herzegovina': 'bosnia and herzegovina',
    'bosnia y herzegovina': 'bosnia and herzegovina',
    'brazil': 'brazil',
    'brasil': 'brazil',
    'morocco': 'morocco',
    'marruecos': 'morocco',
    'haiti': 'haiti',
    'scotland': 'scotland',
    'escocia': 'scotland',
    'united states': 'usa',
    'usa': 'usa',
    'estados unidos': 'usa',
    'paraguay': 'paraguay',
    'australia': 'australia',
    'turkey': 'turkiye',
    'turkiye': 'turkiye',
    'turquia': 'turkiye',
    'germany': 'germany',
    'alemania': 'germany',
    'curacao': 'curacao',
    'curazao': 'curacao',
    'ivory coast': 'ivory coast',
    'costa de marfil': 'ivory coast',
    'ecuador': 'ecuador',
    'netherlands': 'netherlands',
    'paises bajos': 'netherlands',
    'japan': 'japan',
    'japon': 'japan',
    'tunisia': 'tunisia',
    'tunez': 'tunisia',
    'sweden': 'sweden',
    'suecia': 'sweden',
    'belgium': 'belgium',
    'belgica': 'belgium',
    'egypt': 'egypt',
    'egipto': 'egypt',
    'iran': 'iran',
    'ir iran': 'iran',
    'new zealand': 'new zealand',
    'nueva zelanda': 'new zealand',
    'spain': 'spain',
    'espana': 'spain',
    'cabo verde': 'cabo verde',
    'saudi arabia': 'saudi arabia',
    'arabia saudi': 'saudi arabia',
    'uruguay': 'uruguay',
    'france': 'france',
    'francia': 'france',
    'senegal': 'senegal',
    'norway': 'norway',
    'noruega': 'norway',
    'iraq': 'iraq',
    'irak': 'iraq',
    'argentina': 'argentina',
    'algeria': 'algeria',
    'argelia': 'algeria',
    'algelia': 'algeria',
    'austria': 'austria',
    'jordan': 'jordan',
    'jordania': 'jordan',
    'portugal': 'portugal',
    'uzbekistan': 'uzbekistan',
    'uzbekistan ': 'uzbekistan',
    'colombia': 'colombia',
    'dr congo': 'dr congo',
    'rd congo': 'dr congo',
    'congo dr': 'dr congo',
    'england': 'england',
    'inglaterra': 'england',
    'croatia': 'croatia',
    'croacia': 'croatia',
    'ghana': 'ghana',
    'panama': 'panama'
  };

  constructor() { }

  buildLeaderboard(data: GameData): PlayerStanding[] {
    const teamOwnership = this.buildTeamOwnership(data.players);
    const teamDisplayMaps = this.buildTeamDisplayMaps(data.players);
    const scorerDetails = this.buildScorerDetails(data);
    const scorerGoals = this.resolveScorerGoals(data);

    const teamPointsByPlayer = new Map<string, Map<string, number>>();
    const scorerBreakdownByPlayer = new Map<string, ScorerPointsBreakdown[]>();

    for (const player of data.players) {
      const teamMap = new Map<string, number>();
      for (const team of player.teams) {
        teamMap.set(team, 0);
      }
      teamPointsByPlayer.set(player.id, teamMap);

      const scorerBreakdown: ScorerPointsBreakdown[] = player.scorers.map((scorerName) => {
        const scorerKey = this.normalizeKey(scorerName);
        const details = scorerDetails.get(scorerKey);
        const goals = scorerGoals.get(scorerKey) ?? 0;

        return {
          scorer: details?.name ?? scorerName,
          team: details?.team ?? '-',
          goals,
          points: goals
        };
      });

      scorerBreakdownByPlayer.set(player.id, scorerBreakdown);
    }

    for (const match of data.matches) {
      const result = this.getMatchResult(match);
      if (!result) {
        continue;
      }

      this.applyMatchPointsToOwner({
        rawTeamName: match.home_team,
        side: 'home',
        result,
        teamOwnership,
        teamDisplayMaps,
        teamPointsByPlayer
      });

      this.applyMatchPointsToOwner({
        rawTeamName: match.away_team,
        side: 'away',
        result,
        teamOwnership,
        teamDisplayMaps,
        teamPointsByPlayer
      });
    }

    const baseStandings = data.players.map((player) => {
      const teamMap = teamPointsByPlayer.get(player.id) ?? new Map<string, number>();
      const teamBreakdown = Array.from(teamMap.entries()).map(([team, points]) => ({ team, points }));
      const teamPoints = teamBreakdown.reduce((sum, item) => sum + item.points, 0);

      const scorerBreakdown = scorerBreakdownByPlayer.get(player.id) ?? [];
      const scorerPoints = scorerBreakdown.reduce((sum, item) => sum + item.points, 0);

      return {
        playerId: player.id,
        totalPoints: teamPoints + scorerPoints,
        teamPoints,
        scorerPoints,
        teamBreakdown,
        scorerBreakdown
      };
    }).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.playerId.localeCompare(b.playerId, 'es');
    });

    let previousPoints: number | null = null;
    let currentRank = 0;

    return baseStandings.map((standing, index) => {
      if (previousPoints === null || standing.totalPoints !== previousPoints) {
        currentRank = index + 1;
      }
      previousPoints = standing.totalPoints;

      return {
        rank: currentRank,
        ...standing
      };
    });
  }

  buildPichichi(data: GameData): ScorerRankingItem[] {
    const scorerOwnership = this.buildScorerOwnership(data.players);
    const resolvedGoals = this.resolveScorerGoals(data);

    const baseRows = Object.entries(data.scorers_stats).map(([scorer, scorerStat]) => {
      const scorerKey = this.normalizeKey(scorer);

      return {
        scorer,
        team: scorerStat.team,
        goals: resolvedGoals.get(scorerKey) ?? 0,
        owner: scorerOwnership.get(scorerKey) ?? null
      };
    }).sort((a, b) => {
      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }
      return a.scorer.localeCompare(b.scorer, 'es');
    });

    let previousGoals: number | null = null;
    let currentRank = 0;

    return baseRows.map((row, index) => {
      if (previousGoals === null || row.goals !== previousGoals) {
        currentRank = index + 1;
      }
      previousGoals = row.goals;

      return {
        rank: currentRank,
        ...row
      };
    });
  }

  buildTeamPerformance(data: GameData): TeamPerformanceItem[] {
    const teamTotals = new Map<string, { team: string; points: number }>();

    for (const player of data.players) {
      for (const team of player.teams) {
        const canonicalTeam = this.canonicalTeamName(team);
        if (this.excludedTeams.has(canonicalTeam)) {
          continue;
        }

        if (!teamTotals.has(canonicalTeam)) {
          teamTotals.set(canonicalTeam, { team, points: 0 });
        }
      }
    }

    for (const match of data.matches) {
      const result = this.getMatchResult(match);
      if (!result) {
        continue;
      }

      this.applyMatchPointsToTeamTotals(match.home_team, 'home', result, teamTotals);
      this.applyMatchPointsToTeamTotals(match.away_team, 'away', result, teamTotals);
    }

    const sortedRows = Array.from(teamTotals.values()).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return a.team.localeCompare(b.team, 'es');
    });

    let previousPoints: number | null = null;
    let currentRank = 0;

    return sortedRows.map((row, index) => {
      if (previousPoints === null || row.points !== previousPoints) {
        currentRank = index + 1;
      }
      previousPoints = row.points;

      return {
        rank: currentRank,
        team: row.team,
        points: row.points
      };
    });
  }

  canonicalizeTeamName(teamName: string): string {
    return this.canonicalTeamName(teamName);
  }

  resolveMatchWinnerSide(match: Match): MatchSide | null {
    if (match.home_score === null || match.away_score === null) {
      return null;
    }

    const homeScore = Number(match.home_score);
    const awayScore = Number(match.away_score);

    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
      return null;
    }

    if (match.went_to_penalties) {
      return match.penalty_winner_side ?? null;
    }

    if (homeScore === awayScore) {
      return null;
    }

    return homeScore > awayScore ? 'home' : 'away';
  }

  private resolveScorerGoals(data: GameData): Map<string, number> {
    const goalsFromStats = new Map<string, number>();

    Object.entries(data.scorers_stats).forEach(([scorerName, scorerStat]) => {
      const parsedGoals = Number(scorerStat.goals);
      goalsFromStats.set(
        this.normalizeKey(scorerName),
        Number.isFinite(parsedGoals) ? Math.max(0, parsedGoals) : 0
      );
    });

    const eventGoals = new Map<string, number>();

    for (const match of data.matches) {
      for (const goal of match.goals ?? []) {
        if (goal.type !== 'regular' && goal.type !== 'extra_time') {
          continue;
        }

        const scorerKey = this.normalizeKey(goal.scorer);
        const currentGoals = eventGoals.get(scorerKey) ?? 0;
        eventGoals.set(scorerKey, currentGoals + 1);
      }
    }

    if (eventGoals.size === 0) {
      return goalsFromStats;
    }

    const mergedGoals = new Map(goalsFromStats);

    eventGoals.forEach((value, scorerKey) => {
      mergedGoals.set(scorerKey, value);
    });

    return mergedGoals;
  }

  private buildScorerDetails(data: GameData): Map<string, { name: string; team: string }> {
    const details = new Map<string, { name: string; team: string }>();

    Object.entries(data.scorers_stats).forEach(([scorerName, scorerStat]) => {
      details.set(this.normalizeKey(scorerName), {
        name: scorerName,
        team: scorerStat.team
      });
    });

    return details;
  }

  private buildTeamOwnership(players: PlayerAssignment[]): Map<string, string> {
    const ownership = new Map<string, string>();

    for (const player of players) {
      for (const team of player.teams) {
        ownership.set(this.canonicalTeamName(team), player.id);
      }
    }

    return ownership;
  }

  private buildScorerOwnership(players: PlayerAssignment[]): Map<string, string> {
    const ownership = new Map<string, string>();

    for (const player of players) {
      for (const scorer of player.scorers) {
        ownership.set(this.normalizeKey(scorer), player.id);
      }
    }

    return ownership;
  }

  private buildTeamDisplayMaps(players: PlayerAssignment[]): Map<string, Map<string, string>> {
    const displayMaps = new Map<string, Map<string, string>>();

    for (const player of players) {
      const teamMap = new Map<string, string>();

      for (const team of player.teams) {
        teamMap.set(this.canonicalTeamName(team), team);
      }

      displayMaps.set(player.id, teamMap);
    }

    return displayMaps;
  }

  private applyMatchPointsToOwner(args: {
    rawTeamName: string;
    side: 'home' | 'away';
    result: { isDraw: boolean; winner: 'home' | 'away' | null };
    teamOwnership: Map<string, string>;
    teamDisplayMaps: Map<string, Map<string, string>>;
    teamPointsByPlayer: Map<string, Map<string, number>>;
  }): void {
    const teamKey = this.canonicalTeamName(args.rawTeamName);

    if (this.excludedTeams.has(teamKey)) {
      return;
    }

    const owner = args.teamOwnership.get(teamKey);
    if (!owner) {
      return;
    }

    let points = 0;
    if (args.result.isDraw) {
      points = 1;
    } else if (args.result.winner === args.side) {
      points = 3;
    }

    if (points === 0) {
      return;
    }

    const playerTeamPoints = args.teamPointsByPlayer.get(owner);
    if (!playerTeamPoints) {
      return;
    }

    const displayName = args.teamDisplayMaps.get(owner)?.get(teamKey) ?? args.rawTeamName;
    const previousPoints = playerTeamPoints.get(displayName) ?? 0;
    playerTeamPoints.set(displayName, previousPoints + points);
  }

  private applyMatchPointsToTeamTotals(
    rawTeamName: string,
    side: 'home' | 'away',
    result: { isDraw: boolean; winner: 'home' | 'away' | null },
    teamTotals: Map<string, { team: string; points: number }>
  ): void {
    const teamKey = this.canonicalTeamName(rawTeamName);

    if (this.excludedTeams.has(teamKey)) {
      return;
    }

    const teamRow = teamTotals.get(teamKey);
    if (!teamRow) {
      return;
    }

    let points = 0;
    if (result.isDraw) {
      points = 1;
    } else if (result.winner === side) {
      points = 3;
    }

    if (points === 0) {
      return;
    }

    teamRow.points += points;
  }

  private getMatchResult(match: Match): { isDraw: boolean; winner: 'home' | 'away' | null } | null {
    if (match.home_score === null || match.away_score === null) {
      return null;
    }

    const homeScore = Number(match.home_score);
    const awayScore = Number(match.away_score);

    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
      return null;
    }

    if (match.went_to_penalties || homeScore === awayScore) {
      return {
        isDraw: true,
        winner: null
      };
    }

    return {
      isDraw: false,
      winner: homeScore > awayScore ? 'home' : 'away'
    };
  }

  private canonicalTeamName(teamName: string): string {
    const trimmed = teamName.trim();

    if (/^(W|RU)\d+$/i.test(trimmed) || /^\d+[A-Za-z0-9]+$/.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    const normalized = this.normalizeKey(trimmed);
    return this.teamAliases[normalized] ?? normalized;
  }

  private normalizeKey(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
