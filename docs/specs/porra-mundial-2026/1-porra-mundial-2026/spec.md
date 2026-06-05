# Spec: Porra Mundial 2026

**GitHub Issue:** [#1 — game developement](https://github.com/andgonro/Mundialapp2/issues/1)

---

## Overview

This document specifies the full functional, technical, and non-functional requirements for the **Porra Mundial 2026** Angular web application. The app is a serverless sweepstakes tracker for 10 participants following the 2026 FIFA World Cup. All data is loaded from a static `data.json` asset file; standings and statistics are computed in memory on the client.

---

## Functional Requirements

### FR-1: Application Startup & Data Loading

**FR-1.1** — On application startup, the app shall fetch `data.json` from the Angular assets folder via an HTTP GET request before rendering any data-dependent view.

**FR-1.2** — All game state (matches, scores, goals, player assignments, scorer stats) shall be derived exclusively from the contents of `data.json`. No other persistent store is used.

**FR-1.3** — While the data file is loading, the app shall display a loading indicator. If the fetch fails, a user-friendly error message in Spanish shall be shown.

---

### FR-2: Clasificación (Leaderboard View)

**FR-2.1** — The Clasificación view shall be the default landing page of the application.

**FR-2.2** — The view shall display a ranked table of all 10 participants sorted by total points in descending order.

**FR-2.3** — Each participant row shall display: rank position, participant name, total points, a visual indicator of the change since the previous update (optional, nice-to-have), and an expand/collapse control to show the points breakdown.

**FR-2.4** — Total points for a participant shall equal the sum of all match points earned by their 4 assigned teams plus the sum of all goal points earned by their 4 assigned scorers.

**FR-2.5** — Participants with equal total points shall occupy the same rank position. No tiebreaker sub-criterion shall be applied.

**FR-2.6** — The expanded breakdown row shall show: the 4 assigned teams each with their individual points total, and the 4 assigned scorers each with their goals count and corresponding points.

---

### FR-3: Partidos (Fixtures View)

**FR-3.1** — The Partidos view shall list all 104 matches of the 2026 World Cup tournament.

**FR-3.2** — Each match entry shall display: date and local time, stage label (e.g. "Fase de Grupos — Grupo A", "Dieciseisavos", "Final"), home team name, away team name, score (or an em-dash separator "–" if not yet played), and stadium name.

**FR-3.3** — Matches shall be grouped visually by stage. The stages, in order, are: Fase de Grupos, Dieciseisavos de Final, Octavos de Final, Cuartos de Final, Semifinales, Tercer Puesto, and Final.

**FR-3.4** — Within the Fase de Grupos section, matches shall be filterable by group (Grupo A through Grupo L). A "Todos" (All) option shall show all group matches.

**FR-3.5** — Finished matches (status = "FINISHED") shall be visually distinct from upcoming matches (status = "SCHEDULED" or "IN_PLAY"), for example by using a muted or different text colour for unplayed matches.

**FR-3.6** — For knockout stage matches not yet resolved (teams still unknown), the match entry shall display the placeholder team identifier as defined in the fixture data (e.g. "1A vs 2B").

**FR-3.7** — If a knockout match went to penalty shootout, this shall be indicated next to the score (e.g. a "(pen)" label), but the score displayed shall reflect only the 120-minute result.

**FR-3.8** — Within the Fase de Grupos section, below each group's match list, the view shall display a real-time standings table for that group showing: position, team name, matches played (PJ), wins (G), draws (E), losses (P), goals for (GF), goals against (GC), goal difference (DG), and points (Pts). The top two rows in each table shall be visually highlighted as qualifying positions. When the group filter is set to "Todos", all 12 group tables shall be shown.

**FR-3.9** — Each stage section in Partidos shall be independently collapsible/expandable via a visible toggle control in the stage header.

**FR-3.10** — On initial load of the Partidos view, all stage sections shall be collapsed by default.

**FR-3.11** — Inside the Group Stage section, a single "Clasificación" toggle shall collapse/expand all group standings tables and the "Mejores terceros clasificados" block together.

---

### FR-4: Estadísticas (Statistics View)

**FR-4.1 — Pichichi:** A section titled "Pichichi" shall rank all 40 assigned scorers (across all 10 participants) by total goals in descending order. Each row shall show: rank position, scorer name, national team, and total goals.

**FR-4.2** — Scorers with equal total goals shall share the same rank position in the Pichichi table.

**FR-4.3 — Rendimiento de Selecciones:** A section shall rank all 40 active national teams by total points earned in descending order. Each row shall show: rank position, team name, and total points earned. Excluded teams are not listed in this ranking.

**FR-4.4 — Desglose por Participante:** A section shall show, for each of the 10 participants: the participant name, their 4 assigned teams listed with individual points per team, their 4 assigned scorers listed with goals and points per scorer, and their combined total points.

**FR-4.5** — All Statistics sections shall reflect the current state of `data.json` without requiring a page refresh beyond the initial data load.

---

### FR-5: Scoring Rules Engine

**FR-5.1 — Match Win:** When a match result is recorded with a winner, the owning participant of the winning team shall receive 3 points.

**FR-5.2 — Match Draw:** When a match result is recorded as a draw, each owning participant of both teams shall receive 1 point.

**FR-5.3 — Match Loss:** No points are awarded to the owning participant of the losing team.

**FR-5.4 — Knockout Draw (Penalties):** If a knockout match ends in a draw after 120 minutes and proceeds to a penalty shootout, the result shall be treated as a draw by the scoring engine. Both teams' owning participants shall receive 1 point each. The penalty shootout outcome determines match advancement only and has no points impact.

**FR-5.5 — Excluded Teams:** The 8 excluded teams (Haiti, Curaçao, New Zealand, Cabo Verde, Iraq, Jordan, Uzbekistan, Panama) generate zero match points for any participant in all circumstances, regardless of result. Active teams that win or draw against an excluded team still earn their full 3 or 1 points respectively.

**FR-5.6 — Scorer Goals:** Each goal scored by an assigned scorer during regular time or extra time shall award 1 point to the scorer's owning participant.

**FR-5.7 — Excluded Goal Types:** Goals of type "own goal", "assist", or "penalty shootout" shall be excluded from scorer point calculations and shall not increment any participant's points total.

**FR-5.8 — No Scorer Replacements:** If an assigned scorer has zero goals (whether through injury, withdrawal, or non-participation), no replacement is applied. The scorer remains assigned with a goal count of zero.

**FR-5.9 — Tie Resolution:** If two or more participants finish the tournament with equal total points, they share the winning position. No sub-criteria (most goals, champion team, etc.) shall be computed or displayed.

---

### FR-6: Admin Panel

**FR-6.1** — A navigation item labelled "Admin" shall be visible to all users.

**FR-6.2** — When the Admin view is first accessed, it shall display a password input field and a submit button. No data shall be shown before authentication.

**FR-6.3** — On password submission, the entered value shall be hashed client-side (SHA-256) and compared to the stored hash. If the comparison fails, an error message in Spanish shall be displayed ("Contraseña incorrecta"). The input field shall be cleared.

**FR-6.4** — On successful authentication, the Admin view shall display: a list of all matches (with pending matches highlighted), the current leaderboard standings (same data as Clasificación), a match result editor for entering scores and goal events directly in-app, and a section titled "Cómo actualizar resultados" with controls for downloading or publishing the updated `data.json`.

**FR-6.5** — The "Cómo actualizar resultados" section shall display step-by-step written instructions in Spanish describing the 5-step in-app result entry workflow: (1) select a match, (2) enter the score, (3) add goal events per team, (4) apply the update, (5) download or publish the updated `data.json`.

**FR-6.6** — The admin session shall not persist between page refreshes (no session token or cookie is stored). The user must re-enter the password on each visit.

**FR-6.7** — The admin password in plaintext form shall never appear in any source file, template, environment file, or compiled output. Only its SHA-256 hash shall be present in the codebase.

**FR-6.8** — The admin match editor shall allow selecting a match from a list, entering home and away scores, and confirming the update. On confirmation, the match status shall be automatically set to `FINISHED` if both scores are valid non-negative integers. If both score fields are left empty, the match shall be reset to `SCHEDULED` and all derived bracket slots reset to their placeholder codes.

**FR-6.9** — The admin match editor shall display two side-by-side goal entry panels — one for each team in the selected match. Each panel shall list only the scorers assigned to that team, a goal-type selector (regular / extra_time), an "Add goal" button, and a removable list of all goals entered for that team in that match. Scorer goal totals in `scorers_stats` shall be automatically re-derived from match goal events when goals are added or removed.

**FR-6.10** — For knockout matches where the admin activates the "went to penalties" option, a penalty winner selector shall appear allowing the admin to designate the home or away side as the shootout winner. This selection shall determine which team advances in the bracket. The scoring engine shall continue to treat the match as a draw for points purposes (FR-5.4). The penalty winner selector shall only be available for knockout-stage matches.

**FR-6.11** — When a knockout match result is saved, the admin panel shall automatically resolve the immediate dependent bracket slot (`W{id}` or `RU{id}`) in the next-round fixture, replacing that side's current team value with the actual advancing team name by targeting the slot reference metadata when present (`home_bracket_slot` / `away_bracket_slot`). Propagation is single-hop only and does not cascade further than the immediately dependent match.

**FR-6.12** — When the result of a group-stage match completes a group (all 6 matches finished), the admin panel shall automatically populate the 1st-place (`1X`) and 2nd-place (`2X`) bracket slots in the Round of 32 with the corresponding team names from the computed group standings. When all 12 groups are complete, the 8 third-place bracket slots (e.g. `3ABCDF`) shall be automatically resolved by ranking all 12 third-placed teams using FIFA criteria and assigning each to the slot whose eligible group set contains that team's group letter. This update must continue to work even when the current `home_team` / `away_team` values already contain resolved team names from a prior update.

---

## Technical Requirements

### TR-1: Data Model (`data.json`)

**TR-1.1** — The `data.json` file shall be the single source of application state. It shall reside in the Angular project's `src/assets/` folder.

**TR-1.2** — The file shall contain the following top-level keys: `players` (array), `scorers_stats` (object/map), and `matches` (array).

**TR-1.3** — Each entry in the `players` array shall describe one of the 10 participants, including their identifier (e.g. "IOKIN"), their list of 4 assigned team names, and their list of 4 assigned scorer names.

**TR-1.4** — Each entry in `scorers_stats` shall describe one assigned scorer, including the scorer's name as the key, and their national team and current goal count as values.

**TR-1.5** — Each entry in the `matches` array shall include: a unique numeric ID, the stage name, the group identifier (if applicable), ISO 8601 date, local time string, home team name, away team name, home score (null if not yet played), away score (null if not yet played), stadium name, and a status string of either "SCHEDULED", "IN_PLAY", or "FINISHED". For knockout matches that went to a penalty shootout, an optional `penalty_winner_side` field (values: `"home"` or `"away"`) records the side that won the shootout for bracket advancement purposes. For fixtures with derived participants, optional `home_bracket_slot` and `away_bracket_slot` fields shall store the immutable source slot tokens (e.g. `1A`, `3ABCDF`, `W89`, `RU101`).

**TR-1.6** — Each match entry shall include an optional `goals` array. Each goal entry within it shall contain: scorer name and goal type (one of `"regular"`, `"extra_time"`, `"own_goal"`, `"assist"`, or `"penalty_shootout"`). Only goals of type `"regular"` or `"extra_time"` count towards scorer points (FR-5.6, FR-5.7).

**TR-1.7** — Each knockout match entry shall include an optional boolean field `went_to_penalties` (default false). When true, the scoring engine shall treat the match as a draw for points purposes, regardless of the goals difference shown in the score. When `went_to_penalties` is true, the `penalty_winner_side` field (TR-1.5) shall determine the advancing team for bracket slot resolution.

**TR-1.8** — The `data.json` file shall be fully seeded before deployment with all 104 fixtures (as specified in the game rules document), all 10 participant assignments, and all 40 scorer entries with `goals: 0` as their initial state.

**TR-1.9** — For Round of 32 through Final fixtures whose participants are bracket-derived, `home_bracket_slot` and `away_bracket_slot` shall be seeded and remain unchanged during admin updates. Only `home_team` and `away_team` are replaced as progression resolves.

---

### TR-2: Scoring Service

**TR-2.1** — A dedicated Angular service (e.g. `ScoringService`) shall encapsulate all scoring logic described in FR-5.

**TR-2.2** — The service shall be stateless and pure: given the same `data.json` payload, it shall always produce the same computed output. It shall not maintain mutable internal state between calls.

**TR-2.3** — The service shall expose methods for: computing total points per participant, computing points breakdown (teams vs. scorers) per participant, computing the Pichichi ranking, and computing the team performance ranking.

**TR-2.4** — No other component or service shall replicate scoring logic. All point calculations must pass through this single service.

**TR-2.5** — A dedicated `GroupStandingsService` shall compute real-time group standings for all 12 groups from finished group-stage matches. It shall expose: `buildGroupStandings()` (returns standings per group sorted by FIFA cascade: points → goal difference → goals for → head-to-head among tied sub-cluster → alphabetical), `rankThirdPlacedTeams()` (cross-group ranking of all 12 third-placed teams by the same criteria excluding H2H), and `assignThirdPlaceSlots()` (bipartite matching of top 8 third-placed teams to `3XXXXX` slot codes based on group-letter eligibility). This service shall be stateless and pure.

---

### TR-3: Angular Architecture

**TR-3.1** — The project uses Angular 12 (already scaffolded). No upgrade to a newer major version is required.

**TR-3.2** — The app shall use the NgModule architecture (not standalone components), consistent with the Angular 12 scaffold.

**TR-3.3** — The Angular Router shall define four routes: the root path pointing to Clasificación, and named paths for Partidos, Estadísticas, and Admin.

**TR-3.4** — Data loading shall be handled by a single Angular service (e.g. `DataService`) using `HttpClient`. The loaded `data.json` payload shall be shared to all components via this service. The data shall be loaded once per app session (page load), not on every route change.

**TR-3.5** — Angular CLI shall be used to generate all components, services, and modules. Generated files shall not be created manually.

---

### TR-4: Admin Password

**TR-4.1** — The SHA-256 hash of the admin password shall be stored in the Angular environment files (`environment.ts` and `environment.prod.ts`) as a named constant (e.g. `adminPasswordHash`).

**TR-4.2** — The password hashing and comparison in the Admin component shall use the browser's native Web Crypto API (`crypto.subtle.digest`). No external hashing library shall be added as a dependency.

**TR-4.3** — The SHA-256 hash value stored in the environment files shall be the only representation of the admin password in the codebase. The plaintext string `mundial2026` shall not appear in any committed file.

---

### TR-5: Deployment

**TR-5.1** — The app shall be deployable to GitHub Pages or any equivalent static hosting provider using the Angular production build output.

**TR-5.2** — The `data.json` file shall be served from the Angular assets folder, meaning it is bundled and deployed as part of the static site. Updating standings requires editing `data.json` in the repository and re-deploying (or simply committing the updated file to the branch used by GitHub Pages).

**TR-5.3** — The production build shall use the `--base-href` flag set to the correct GitHub Pages path if deployed under a sub-path (e.g. `/porra-mundial-2026/`).

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1** — The app shall display the Clasificación (Leaderboard) in under 2 seconds on a standard mobile 4G connection after initial page load.

**NFR-1.2** — The total production build size (JavaScript, CSS, and assets excluding `data.json`) shall not exceed 2 MB.

**NFR-1.3** — All leaderboard and statistics calculations shall complete synchronously in memory without observable UI lag after `data.json` is loaded.

---

### NFR-2: Availability

**NFR-2.1** — The app shall be hosted on a free static platform (GitHub Pages or equivalent) with zero custom server infrastructure to maintain.

**NFR-2.2** — No uptime SLA is defined beyond what the hosting platform guarantees. The app is a personal project.

---

### NFR-3: Usability

**NFR-3.1** — All user-facing text, labels, headings, and messages shall be in Spanish.

**NFR-3.2** — The app shall be fully usable on mobile screens with a minimum viewport width of 320px, without requiring horizontal scrolling on any view.

**NFR-3.3** — All interactive touch targets (navigation items, buttons, expand controls) shall be at minimum 44×44px in their tappable area.

**NFR-3.4** — The visual theme shall use a dark background with gold and green accent colours throughout, consistent across all four views.

**NFR-3.5** — Navigation between the four views shall be accessible from a persistent navigation bar or menu present on every screen.

---

### NFR-4: Security

**NFR-4.1** — The admin password shall not be stored or transmitted in plaintext anywhere in the application source code, build output, or repository history.

**NFR-4.2** — The application shall not collect, transmit, or store any personal user data. No analytics, cookies, or tracking scripts shall be included.

**NFR-4.3** — No user registration, login, or session management is required for the read-only public views.

**NFR-4.4** — The client-side admin password check is acknowledged as low-security (a determined user could extract the hash from the compiled bundle). This is acceptable for a private friend group application with no sensitive data.

---

## Out of Scope

- Real-time automatic data synchronisation (Firebase, WebSockets, or similar push mechanisms)
- In-app result entry that writes directly to a backend or repository without a manual commit
- User accounts, login sessions, or role-based access control
- Push notifications or alerts for match results
- Historical data from prior World Cup tournaments
- Attribution of penalty shootout goal scorers for any purpose
- Mobile app (iOS/Android native or PWA installation)
- Multi-language support

---

## Future Considerations

- **GitHub API auto-commit**: An enhanced admin flow that uses a GitHub Personal Access Token to commit the updated `data.json` directly from the in-app form, eliminating the need to edit the file manually.
- **Progressive Web App (PWA)**: Adding a service worker to allow the app to load offline (using cached `data.json`) and to be installed on the home screen.
- **Automated result import**: Integration with a public football data API (e.g. football-data.org) to fetch match results automatically and generate the updated `data.json`.
- **Animated leaderboard transitions**: Visual rank-change animations when standings update.
