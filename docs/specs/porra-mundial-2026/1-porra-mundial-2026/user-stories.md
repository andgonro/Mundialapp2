# User Stories: Porra Mundial 2026

**GitHub Issue:** [#1 — game developement](https://github.com/andgonro/porra-mundial-2026/issues/1)

---

## US-1: View the Leaderboard

**As a** participant,  
**I want to** see a ranked table of all 10 players and their current total points,  
**So that** I can know who is winning at any moment during the tournament without asking in the group chat.

### Acceptance Criteria

- [ ] When I open the app, the Clasificación (Leaderboard) is the first view I see
- [ ] Each row displays: rank position, participant name, and total points
- [ ] The table is sorted from highest to lowest total points
- [ ] Players with equal total points occupy the same rank position (e.g. two players both showing "2nd place")
- [ ] No tiebreaker logic is applied — tied players always share the rank
- [ ] Each row has an expand or tap control that reveals a breakdown: points earned from each of the player's 4 teams and goals/points from each of their 4 scorers
- [ ] If no matches have been played yet, all 10 players show 0 points
- [ ] If `data.json` fails to load, a message in Spanish is shown (e.g. "Error al cargar los datos") and no table is rendered

---

## US-2: View Match Fixtures and Results

**As a** participant,  
**I want to** see the complete list of all 104 matches with dates, teams, and results,  
**So that** I can track which matches have been played and what the outcomes were.

### Acceptance Criteria

- [ ] All 104 matches are displayed in the Partidos view
- [ ] Matches are grouped by stage: Fase de Grupos, Dieciseisavos de Final, Octavos de Final, Cuartos de Final, Semifinales, Tercer Puesto, and Final
- [ ] Each match shows: date, time, stage/group label, home team, away team, final score (or "–" if not yet played), and stadium name
- [ ] Finished matches are visually distinct from unplayed matches (e.g. different text colour or background)
- [ ] Group stage matches can be filtered by group (Grupo A through Grupo L) with a "Todos" option to show all
- [ ] Knockout stage matches that are not yet resolved show placeholder identifiers (e.g. "1A vs 2B") instead of team names
- [ ] A knockout match that went to a penalty shootout displays the 120-minute score alongside a "(pen.)" label
- [ ] Match data is read directly from `data.json` with no manual duplication in component code

---

## US-3: Earn Points from Team Match Results

**As the** scoring engine,  
**I want** match results to automatically translate into points for each participant who owns that team,  
**So that** the leaderboard reflects the correct standings after every match.

### Acceptance Criteria

- [ ] A win by an active team awards 3 points to the participant who owns that team
- [ ] A draw by an active team awards 1 point to the participant who owns that team
- [ ] A loss by an active team awards 0 points to the owning participant
- [ ] A knockout match recorded as a draw (after 120 minutes) awards 1 point to each owning participant, regardless of which team wins the penalty shootout
- [ ] A win or draw by one of the 8 excluded teams (Haiti, Curaçao, New Zealand, Cabo Verde, Iraq, Jordan, Uzbekistan, Panama) awards 0 points to any participant
- [ ] If an active team beats an excluded team, the active team's owning participant still receives the full 3 points
- [ ] If an active team draws with an excluded team, the active team's owning participant still receives 1 point; no participant receives points on behalf of the excluded team
- [ ] All match point calculations are performed by the ScoringService; no component performs its own points logic

---

## US-4: Earn Points from Scorer Goals

**As the** scoring engine,  
**I want** goals scored by assigned footballers to award points to the participant who owns that scorer,  
**So that** scorer assignments contribute meaningfully to each participant's total.

### Acceptance Criteria

- [ ] Each goal by an assigned scorer recorded with type "regular" or extra-time awards 1 point to their owning participant
- [ ] Goals with type "penalty_shootout" are excluded from scorer points
- [ ] Goals with type "own_goal" are excluded from scorer points
- [ ] Assists are not tracked or awarded any points
- [ ] If a scorer has 0 goals (due to injury, withdrawal, or not being selected), 0 points are awarded — no replacement scorer is applied
- [ ] Each scorer is owned by exactly one participant; no goal can award points to more than one participant
- [ ] Scorer point calculations are performed exclusively by the ScoringService

---

## US-5: View the Pichichi (Top Scorers Ranking)

**As a** participant,  
**I want to** see a ranking of the assigned footballers by total goals scored,  
**So that** I can follow which scorers are performing best and how they affect the standings.

### Acceptance Criteria

- [ ] A "Pichichi" section in the Estadísticas view ranks all 40 assigned scorers by total goals in descending order
- [ ] Each row shows: rank position, scorer name, national team, and goal total
- [ ] Scorers with equal goals share the same rank position
- [ ] Scorers with 0 goals are listed at the bottom
- [ ] Goals from own goals and penalty shootouts are excluded from the displayed goal count
- [ ] The ranking updates automatically when `data.json` is refreshed (on next page load)

---

## US-6: View Team Performance Ranking

**As a** participant,  
**I want to** see which national teams have earned the most sweepstakes points,  
**So that** I can understand how my assigned teams compare to others in the game.

### Acceptance Criteria

- [ ] A "Rendimiento de Selecciones" section in the Estadísticas view ranks the 40 active teams by total sweepstakes points earned (descending)
- [ ] Each row shows: rank position, team name, and total points
- [ ] The 8 excluded teams do not appear in this ranking
- [ ] Teams with equal points share the same rank position
- [ ] Teams with 0 points are listed at the bottom

---

## US-7: View Per-Participant Points Breakdown

**As a** participant,  
**I want to** see a detailed breakdown of where each player's points come from,  
**So that** I can understand exactly how many points came from teams versus scorers and verify my own totals.

### Acceptance Criteria

- [ ] A "Desglose por Participante" section in the Estadísticas view shows all 10 participants
- [ ] For each participant, the breakdown lists their 4 assigned teams, the points each team has earned, their 4 assigned scorers, the goals and points each scorer has contributed, and the combined total points
- [ ] The breakdown totals match identically with the totals shown in the Clasificación view
- [ ] The section is readable on a mobile screen without horizontal scrolling

---

## US-8: Unlock the Admin Panel

**As the** game admin,  
**I want to** unlock an admin view by entering a password,  
**So that** I can see which matches still need results and receive instructions for updating the data file.

### Acceptance Criteria

- [ ] An "Admin" navigation item is visible to all users on every screen
- [ ] Accessing the Admin route shows only a password input and submit button — no data is exposed before authentication
- [ ] Entering the wrong password displays the message "Contraseña incorrecta" in Spanish and clears the input field; no data is revealed
- [ ] Entering the correct password (verified by comparing its SHA-256 hash against the stored hash in the environment file) reveals the full admin view
- [ ] The admin view lists all matches with status "SCHEDULED" or "IN_PLAY" as pending result entry
- [ ] The admin view includes a "Cómo actualizar resultados" section with step-by-step written instructions in Spanish for editing `data.json` via the GitHub repository web editor and committing the change
- [ ] The admin session does not persist after a page refresh — the password must be re-entered on each visit
- [ ] The plaintext password `mundial2026` does not appear in any source file, template, environment file, or compiled output

---

## US-9: Access the App on a Mobile Phone

**As a** participant using a smartphone,  
**I want** the app to be fully readable and navigable on my phone,  
**So that** I can check the standings anywhere without needing a laptop.

### Acceptance Criteria

- [ ] All four views (Clasificación, Partidos, Estadísticas, Admin) render correctly on a minimum viewport width of 320px
- [ ] No horizontal scrolling is required on any view at 320px width or above
- [ ] Navigation is accessible via a mobile-friendly menu or navigation bar
- [ ] All interactive elements (buttons, tabs, expand controls) have a tappable area of at least 44×44px
- [ ] The dark theme is legible in both daylight and dark environments
- [ ] Text is readable without zooming on standard mobile font sizes (minimum 14px for body text)
- [ ] The app loads in under 2 seconds on a standard 4G mobile connection

---

## US-10: Correct Handling of Knockout Stage Edge Cases

**As the** scoring engine,  
**I want** knockout stage match rules to be applied correctly,  
**So that** participants' points are never wrongly inflated or deflated by penalty shootout or extra-time scenarios.

### Acceptance Criteria

- [ ] A knockout match that ends 1–1 after 90 minutes and goes to extra time, still ending 1–1, is recorded as a draw — both owning participants receive 1 point each
- [ ] The team that wins the penalty shootout does NOT receive additional points beyond the 1 draw point already awarded
- [ ] A knockout match that ends 2–1 after 90 or 120 minutes (no draw) is recorded as a win — only the winning team's owning participant receives 3 points
- [ ] The `went_to_penalties` flag in `data.json` is used solely to display the "(pen.)" label in the Partidos view; it has no effect on point calculations
- [ ] Scorer goals recorded during a penalty shootout (type "penalty_shootout") do not contribute to any participant's scorer points, even if a scorer scores in both the match and the shootout
