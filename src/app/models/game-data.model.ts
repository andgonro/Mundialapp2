export type MatchStatus = 'SCHEDULED' | 'IN_PLAY' | 'FINISHED';
export type MatchSide = 'home' | 'away';

export type GoalType = 'regular' | 'extra_time' | 'own_goal' | 'assist' | 'penalty_shootout';

export interface PlayerAssignment {
	id: string;
	teams: string[];
	scorers: string[];
}

export interface ScorerStat {
	team: string;
	goals: number;
}

export interface MatchGoal {
	scorer: string;
	type: GoalType;
}

export interface Match {
	id: number;
	stage: string;
	stage_label: string;
	group: string | null;
	date: string;
	time: string;
	home_team: string;
	away_team: string;
	home_score: number | null;
	away_score: number | null;
	stadium: string;
	status: MatchStatus;
	went_to_penalties?: boolean;
	penalty_winner_side?: MatchSide;
	goals?: MatchGoal[];
}

export interface GameData {
	players: PlayerAssignment[];
	scorers_stats: Record<string, ScorerStat>;
	matches: Match[];
}

export interface TeamPointsBreakdown {
	team: string;
	points: number;
}

export interface ScorerPointsBreakdown {
	scorer: string;
	team: string;
	goals: number;
	points: number;
}

export interface PlayerStanding {
	rank: number;
	playerId: string;
	totalPoints: number;
	teamPoints: number;
	scorerPoints: number;
	teamBreakdown: TeamPointsBreakdown[];
	scorerBreakdown: ScorerPointsBreakdown[];
}

export interface ScorerRankingItem {
	rank: number;
	scorer: string;
	team: string;
	goals: number;
	owner: string | null;
}

export interface TeamPerformanceItem {
	rank: number;
	team: string;
	points: number;
}
