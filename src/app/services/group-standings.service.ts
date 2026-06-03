import { Injectable } from '@angular/core';
import { GroupStandingRow, Match, MatchSide } from '../models/game-data.model';

const ALL_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

export interface ThirdPlaceBracketSlot {
  code: string;
  matchId: number;
  side: MatchSide;
}

@Injectable({
  providedIn: 'root'
})
export class GroupStandingsService {

  /**
   * Computes the standings table for all 12 groups from finished group-stage matches.
   * Returns a map of group letter → sorted standings rows (1st, 2nd, 3rd, 4th).
   */
  buildGroupStandings(matches: Match[]): Record<string, GroupStandingRow[]> {
    const result: Record<string, GroupStandingRow[]> = {};

    for (const group of ALL_GROUPS) {
      const groupMatches = matches.filter(
        (m) => m.stage === 'Group Stage' && m.group === group
      );
      const teams = this.collectTeams(groupMatches);
      const rows = teams.map((team) => this.computeRow(team, group, groupMatches));
      result[group] = this.sortGroupRows(rows, groupMatches);
    }

    return result;
  }

  /**
   * Returns all 12 third-placed rows sorted by cross-group FIFA criteria
   * (pts → GD → GF → alphabetical). No H2H applies across groups.
   */
  rankThirdPlacedTeams(standings: Record<string, GroupStandingRow[]>): GroupStandingRow[] {
    const thirds: GroupStandingRow[] = [];

    for (const group of ALL_GROUPS) {
      const rows = standings[group] ?? [];
      if (rows.length >= 3) {
        thirds.push(rows[2]);
      }
    }

    return this.sortCrossGroupRows(thirds);
  }

  /**
   * Given the top 8 third-placed teams and the slot definitions from the bracket,
   * assigns each team to the slot whose group-letter set includes that team's group.
   * Uses backtracking DFS (8 items max — fast and deterministic).
   * Returns a Map<slotCode, teamName>.
   */
  assignThirdPlaceSlots(
    qualifyingThirds: GroupStandingRow[],
    bracketSlots: ThirdPlaceBracketSlot[]
  ): Map<string, string> {
    const slotCodes = bracketSlots.map((s) => s.code);
    const assignment: string[] = new Array(slotCodes.length).fill('');
    const usedTeams = new Set<string>();

    this.bipartiteMatch(qualifyingThirds, slotCodes, 0, assignment, usedTeams);

    const result = new Map<string, string>();
    slotCodes.forEach((code, i) => {
      if (assignment[i]) {
        result.set(code, assignment[i]);
      }
    });

    return result;
  }

  private bipartiteMatch(
    teams: GroupStandingRow[],
    slotCodes: string[],
    slotIndex: number,
    assignment: string[],
    usedTeams: Set<string>
  ): boolean {
    if (slotIndex === slotCodes.length) {
      return true;
    }

    // The letters after the leading '3' are the eligible groups for this slot
    const slotLetters = slotCodes[slotIndex].slice(1);
    const eligibleTeams = teams.filter(
      (t) => slotLetters.includes(t.group) && !usedTeams.has(t.teamName)
    );

    for (const team of eligibleTeams) {
      assignment[slotIndex] = team.teamName;
      usedTeams.add(team.teamName);

      if (this.bipartiteMatch(teams, slotCodes, slotIndex + 1, assignment, usedTeams)) {
        return true;
      }

      usedTeams.delete(team.teamName);
      assignment[slotIndex] = '';
    }

    return false;
  }

  private collectTeams(groupMatches: Match[]): string[] {
    const teams = new Set<string>();
    for (const match of groupMatches) {
      teams.add(match.home_team);
      teams.add(match.away_team);
    }
    return Array.from(teams);
  }

  private computeRow(teamName: string, group: string, matches: Match[]): GroupStandingRow {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of matches) {
      if (match.status !== 'FINISHED') {
        continue;
      }

      if (match.home_score === null || match.away_score === null) {
        continue;
      }

      const isHome = match.home_team === teamName;
      const isAway = match.away_team === teamName;

      if (!isHome && !isAway) {
        continue;
      }

      played++;
      const gf = isHome ? match.home_score : match.away_score;
      const ga = isHome ? match.away_score : match.home_score;
      goalsFor += gf;
      goalsAgainst += ga;

      if (gf > ga) {
        won++;
      } else if (gf === ga) {
        drawn++;
      } else {
        lost++;
      }
    }

    return {
      group,
      teamName,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: won * 3 + drawn
    };
  }

  /**
   * Sorts group rows using FIFA cascade: pts → GD → GF → H2H sub-sort → alphabetical.
   * H2H sub-sort applies only within a tied cluster.
   */
  private sortGroupRows(rows: GroupStandingRow[], groupMatches: Match[]): GroupStandingRow[] {
    if (rows.length <= 1) {
      return [...rows];
    }

    // Phase 1: primary sort (pts, GD, GF) to build initial order
    const primary = [...rows].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return 0;
    });

    // Phase 2: for each tied cluster (same pts, GD, GF), apply H2H sub-sort
    const result: GroupStandingRow[] = [];
    let i = 0;

    while (i < primary.length) {
      const curr = primary[i];
      let j = i + 1;

      while (
        j < primary.length &&
        primary[j].points === curr.points &&
        primary[j].goalDifference === curr.goalDifference &&
        primary[j].goalsFor === curr.goalsFor
      ) {
        j++;
      }

      const cluster = primary.slice(i, j);

      if (cluster.length > 1) {
        result.push(...this.sortByH2H(cluster, groupMatches));
      } else {
        result.push(curr);
      }

      i = j;
    }

    return result;
  }

  /**
   * Sub-sorts a tied cluster by their H2H results among themselves.
   * Falls back to alphabetical if H2H is also tied.
   */
  private sortByH2H(cluster: GroupStandingRow[], groupMatches: Match[]): GroupStandingRow[] {
    const clusterTeams = cluster.map((r) => r.teamName);
    const h2hMatches = groupMatches.filter(
      (m) =>
        m.status === 'FINISHED' &&
        clusterTeams.includes(m.home_team) &&
        clusterTeams.includes(m.away_team)
    );

    const h2hRows = cluster.map((row) => this.computeRow(row.teamName, row.group, h2hMatches));

    const h2hSorted = [...h2hRows].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName, 'es');
    });

    return h2hSorted.map((h) => cluster.find((r) => r.teamName === h.teamName)!);
  }

  /**
   * Sorts rows using pts → GD → GF → alphabetical (no H2H — used for cross-group ranking).
   */
  private sortCrossGroupRows(rows: GroupStandingRow[]): GroupStandingRow[] {
    return [...rows].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName, 'es');
    });
  }
}
