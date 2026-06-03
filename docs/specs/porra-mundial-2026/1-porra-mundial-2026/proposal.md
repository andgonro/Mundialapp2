# Proposal - Porra Mundial 2026

**GitHub Issue:** [#1 — game developement](https://github.com/andgonro/porra-mundial-2026/issues/1)

---

## Summary

A serverless Angular web application for tracking a 2026 FIFA World Cup sweepstakes ("porra") among 10 friends. Players accumulate points based on their pre-assigned national teams' match results and pre-assigned footballers' individual goals throughout the tournament. Anyone can view the standings from their phone; the admin updates the data by editing a JSON file in the GitHub repository.

---

## Context

### Motivation

Ten friends are participating in a "porra" (sweepstakes) for the 2026 FIFA World Cup. Without a shared platform, standings must be tracked manually — typically in a group chat — which is error-prone, time-consuming, and means no one can check the ranking independently. This app eliminates that friction by providing a single, always-accessible source of truth.

### Current Limitation

There is no shared, automatically-calculating platform for the group. Standings are computed manually after each match, creating room for errors and delays.

### Stakeholders

- **10 Participants (read-only viewers):** IOKIN, PIWI, ISUSKO, AMORRORTU, PENFOR, PLUTS, LUISON, TXONTXE, SOLA, POLACO
- **Admin (data entry):** One or more friends comfortable editing a JSON file in the GitHub repo after each match. No special login is required beyond knowing the admin password to unlock the admin info panel.

### User Experience Impact

Participants can open the URL on their phone at any time during the tournament and instantly see the current standings, top scorers, and team performances — without needing to ask in the group chat.

---

## High-Level Approach

- An Angular application is deployed to a free static host (e.g. GitHub Pages). No backend server is required.
- All game data — fixture list, player-team assignments, player-scorer assignments, match results, and individual goals — is stored in a single `data.json` file committed to the GitHub repository and served from the app's assets folder.
- On every page load the app fetches `data.json`, computes all standings and statistics in memory using a dedicated Angular scoring service, and renders the results.
- The admin updates standings by editing `data.json` directly in the repository (via the GitHub web editor or local commit) and pushing a new commit. The app reflects the change on next page load.
- The app has four main navigable views in Spanish: **Clasificación** (Leaderboard), **Partidos** (Fixtures), **Estadísticas** (Statistics), and **Admin**.
- The Admin view is locked behind a password entry. The password (`mundial2026`) is never stored as plaintext in the source code; it is verified client-side against its SHA-256 hash. Once unlocked, the Admin view displays the current data state and step-by-step instructions for updating the JSON file.
- The visual theme is dark with gold and green accents (football stadium aesthetic), mobile-first, and all UI text is in Spanish.

---

## Deliverables

1. **`data.json`** — Fully seeded data file containing all 104 match fixtures, all 10 player-to-team and player-to-scorer assignments, and initial zero-score state for all scorers.
2. **Angular Scoring Service** — Pure, stateless service that computes: total points per player, points breakdown (teams vs. scorers), top scorer ranking, and team performance ranking from a given `data.json` input.
3. **Four routed Angular views:**
   - Clasificación (Leaderboard with expandable points breakdown)
   - Partidos (Full fixture list, filterable by stage and group)
   - Estadísticas (Pichichi, team performance, per-player breakdown)
   - Admin (password-locked, shows data summary and update instructions)
4. **Responsive UI** — Dark/gold/green theme, mobile-first layout (min 320px width), all text in Spanish.

---

## Notes

- The **8 excluded teams** (Haiti, Curaçao, New Zealand, Cabo Verde, Iraq, Jordan, Uzbekistan, Panama) appear in the fixture list so that active teams can earn points when playing against them. However, wins or draws by excluded teams do not award points to any player.
- For knockout matches that go to **penalty shootout**, the result is stored as a draw in `data.json`. Both teams' owners receive +1 point. The shootout winner is noted for display purposes only and grants no additional points.
- **Goals in penalty shootouts, own goals, and assists** are excluded from scorer point calculations.
- **No replacements** are allowed for injured or withdrawn scorers. That scorer simply retains their current goal total.
- **Tied total points** means a shared prize — no tiebreaker criteria will be computed.
- The admin password is verified against a SHA-256 hash. The hash is stored in the Angular environment file, not in the component source, and the plaintext password is never committed to the codebase.
