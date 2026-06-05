# User Stories: Porra Mundial 2026

**GitHub Issue:** [#1 — game developement](https://github.com/andgonro/Mundialapp2/issues/1)

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
- [ ] Each stage block has an expand/collapse control and all stage blocks are collapsed by default when the Partidos view first loads
- [ ] Expanding or collapsing one stage does not modify the expanded state of other stages
- [ ] Each match shows: date, time, stage/group label, home team, away team, final score (or "–" if not yet played), and stadium name
- [ ] Finished matches are visually distinct from unplayed matches (e.g. different text colour or background)
- [ ] Group stage matches can be filtered by group (Grupo A through Grupo L) with a "Todos" option to show all
- [ ] Inside the Group Stage section, a single "Clasificación" toggle collapses/expands both the per-group standings tables and the "Mejores terceros clasificados" block together
- [ ] Knockout stage matches that are not yet resolved show placeholder identifiers (e.g. "1A vs 2B") instead of team names
- [ ] A knockout match that went to a penalty shootout displays the 120-minute score alongside a "(pen.)" label
- [ ] Match data is read directly from `data.json` with no manual duplication in component code
- [ ] Within the Fase de Grupos section, a standings table is shown for each group (or only the selected group when a filter is active), displaying position, team name, PJ/G/E/P/GF/GC/DG/Pts; the top two rows are visually highlighted as qualifying positions

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
- [ ] The admin view displays all matches with those pending result entry highlighted; it includes a match result editor for entering scores and per-team goal events directly in-app
- [ ] The admin view includes a "Cómo actualizar resultados" section with step-by-step written instructions in Spanish for the 5-step in-app result entry workflow, and controls for downloading or publishing the updated `data.json`
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

---

## US-11: Admin Enters Match Result In-App

**As the** game admin,  
**I want to** select a match from the list and enter its final score directly in the admin panel,  
**So that** I don't need to manually edit `data.json` in a text editor for every result.

### Acceptance Criteria

- [ ] A match selector lists all matches; selecting a match populates the score input fields with the current scores (if any)
- [ ] Home and away score inputs accept non-negative integers or empty (to reset the match)
- [ ] Clicking "Apply" with valid scores sets the match status to `FINISHED` automatically
- [ ] Clicking "Apply" with both fields empty resets the match to `SCHEDULED` and clears derived bracket slots back to their placeholder codes
- [ ] If both scores are provided but only one field is filled, an error message in Spanish is displayed
- [ ] For knockout matches, a "Fue a penaltis" checkbox is available; checking it reveals a penalty winner selector (home/away)
- [ ] The penalty winner selector is only available for knockout-stage matches
- [ ] If the knockout match is a draw and penalties are not checked, an error message prevents saving
- [ ] If penalties are checked but no winner is selected, an error message prevents saving
- [ ] All validation error messages are displayed in Spanish

---

## US-12: Admin Records Scorer Goals Per Match

**As the** game admin,  
**I want to** add or remove individual goal events for each team in a selected match,  
**So that** scorer points update automatically without me having to manually count and edit the `scorers_stats` section.

### Acceptance Criteria

- [ ] The match editor shows two goal panels side by side, one for the home team and one for the away team
- [ ] Each panel lists only the scorers assigned to that team in `scorers_stats`
- [ ] Each panel has a scorer dropdown, a goal type selector (regular / extra_time), and an "Add goal" button
- [ ] Added goals appear as a removable list within each panel
- [ ] Removing a goal from the list immediately re-syncs that scorer's goal total in `scorers_stats`
- [ ] Scorer goal totals are always derived from match goal events, not entered manually (unless the advanced override editor is used)
- [ ] An advanced scorer override toggle reveals a legacy manual scorer-goals editor for exceptional corrections

---

## US-13: Knockout and Group Bracket Auto-Population

**As the** game admin,  
**I want** the bracket slots in the Round of 32 and later rounds to be filled in automatically when I save a match result,  
**So that** I never need to manually look up which team advances and type it into the data.

### Acceptance Criteria

- [ ] After a knockout match is saved as `FINISHED`, the immediately dependent `W{id}` or `RU{id}` bracket slot in the next-round fixture is automatically updated with the advancing team name
- [ ] Knockout propagation still updates the correct dependent fixture side even if that side currently contains a previously resolved team name
- [ ] If a knockout match result is cleared (reset to `SCHEDULED`), the dependent bracket slot reverts to its placeholder code (e.g. `W73`)
- [ ] After a group-stage match completes a group (all 6 matches `FINISHED`), the `1X` and `2X` Round of 32 bracket slots for that group are automatically populated with the 1st- and 2nd-placed team names
- [ ] If a group-stage result is cleared and the group is no longer complete, the `1X` and `2X` slots revert to their placeholder codes
- [ ] When all 12 groups are complete, the 8 third-place bracket slots (e.g. `3ABCDF`) are automatically resolved using FIFA criteria and each assigned a team whose group letter appears in the slot code's eligible set
- [ ] Third-place bracket slots are reset to their placeholder codes whenever any group becomes incomplete again
- [ ] Round of 32 through Final fixtures preserve immutable bracket slot references so progression logic can always retarget the correct match side independently of current displayed team names
