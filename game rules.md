# 🏆 2026 World Cup Sweepstakes - Project Documentation

This document contains the business rules, scoring system, tournament structure, architecture decisions, and initial seed data for developing the **2026 World Cup Sweepstakes** web application.

---

## 📌 1. Game Rules & Configuration

### 👥 Participants and Structure
* **Total Users:** 10 players: `[ IOKIN, PIWI, ISUSKO, AMORRORTU, PENFOR, PLUTS, LUISON, TXONTXE, SOLA, POLACO ]`
* **Teams per Player:** 4 national teams (The maximum possible number for an equal distribution).
* **Scorers per Player:** 4 football players.
* **Winning Criterion:** The player who accumulates the most total points by the end of the tournament wins.

### ⚽ Assignment Rules (Teams)
* **Total Teams in Play:** 40 teams (Out of the 48 official World Cup teams, 8 teams have been excluded from the draft pool to balance the game completely across 10 players).
* **Pot Distribution:** Each player receives exactly one team from Pot 1, Pot 2, Pot 3, and Pot 4 to ensure total competitive equity.
* **Group Restriction:** A player's 4 teams must belong to **different groups** in the real World Cup group stage, preventing them from playing against themselves in the first round.

### 🏃‍♂️ Assignment Rules (Scorers)
* **Pot Distribution:** Scorers are divided into 4 pots based on their tier/goalscoring probability. Each player receives one scorer from each pot.
* **Nationality Restriction:** A player's 4 scorers must be from **different national teams** (two scorers from the same country are not allowed for the same user).

---

## 📊 2. Scoring & Core Game Logic (Edge Cases Closed)

| Event | Points Awarded | Entity Type |
| :--- | :---: | :--- |
| **Match Won** | +3 pts | Team |
| **Match Drawn** | +1 pt | Team |
| **Goal Scored** | +1 pt per goal | Scorer |

### 🚫 Exclusions and Restrictions
* **No Round Advancement Points:** Points are ONLY awarded for match results (win/draw) and individual player goals. No extra points are given for qualifying to the Round of 32, 16, etc.
* **Knockout Stage Logic (Draws):** If a knockout match ends in a tie after 120 minutes (regular time + extra time), it is registered in the sweepstakes application as a **Draw (+1 pt for both teams)**. The subsequent penalty shootout is purely used to determine who physically advances, but grants no extra points to the team.
* **Penalty Shootout Goals:** Goals scored during a post-match penalty shootout **DO NOT COUNT** towards the scorer's total points. Only goals scored during regular or extra time (first 120 minutes of play) are valid.
* **Own Goals & Assists:** Own goals (autogoles) and assists **DO NOT COUNT**.
* **Player Injuries / Withdrawals:** If an assigned scorer gets injured, banned, or drops out of the World Cup at any point, **no replacements are allowed** ("te fastidias"). The user keeps that scorer with their current goals.
* **Tie-Breaker Rule:** If two or more users finish the tournament with the exact same amount of points, **the prize and the honor are shared**. No sub-criteria (like most goals or champion team) will be computed.

---

## 🗺️ 3. Tournament Structure (2026 World Cup)

The tournament officially consists of **48 teams** split into **12 groups of 4** (Groups A through L). The **8 teams marked with `(⚠️ EXCLUDED)`** do not grant match points to any player, but their fixtures must still be stored so that active teams can receive points when playing against them.

### 📋 Group Stage Composition

* **Group A:** 🇲🇽 Mexico | 🇿🇦 South Africa | 🇰🇷 South Korea | 🇨🇿 Czechia
* **Group B:** 🇨🇦 Canada | 🇨🇭 Switzerland | 🇶🇦 Qatar | 🇧🇦 Bosnia and Herzegovina
* **Group C:** 🇧🇷 Brazil | 🇲🇦 Morocco | 🇭🇹 Haiti `(⚠️ EXCLUDED)` | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland
* **Group D:** 🇺🇸 United States | 🇵🇾 Paraguay | 🇦🇺 Australia | 🇹🇷 Türkiye
* **Group E:** 🇩🇪 Germany | 🇨🇼 Curaçao `(⚠️ EXCLUDED)` | 🇨🇮 Côte d'Ivoire | 🇪🇨 Ecuador
* **Group F:** 🇳🇱 Netherlands | 🇯🇵 Japan | 🇹🇳 Tunisia | 🇸🇪 Sweden
* **Group G:** 🇧🇪 Belgium | 🇪🇬 Egypt | 🇮🇷 IR Iran | 🇳🇿 New Zealand `(⚠️ EXCLUDED)`
* **Group H:** 🇪🇸 Spain | 🇨🇻 Cabo Verde `(⚠️ EXCLUDED)` | 🇸🇦 Saudi Arabia | 🇺🇾 Uruguay
* **Group I:** 🇫🇷 France | 🇸🇳 Senegal | 🇳🇴 Norway | 🇮🇶 Iraq `(⚠️ EXCLUDED)`
* **Group J:** 🇦🇷 Argentina | 🇩🇿 Algeria | 🇦🇹 Austria | 🇯🇴 Jordan `(⚠️ EXCLUDED)`
* **Group K:** 🇵🇹 Portugal | 🇺🇿 Uzbekistan `(⚠️ EXCLUDED)` | 🇨🇴 Colombia | 🇨🇩 Congo DR
* **Group L:** 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | 🇭🇷 Croatia | 🇬🇭 Ghana | 🇵🇦 Panama `(⚠️ EXCLUDED)`

---

## 💻 4. Application Architecture & UX

### 🛠️ Serverless / No-Database Approach
To simplify deployment and infrastructure overhead, **no database (SQL/NoSQL) will be used**. All application states (Matches, Standings, Users, and Statistics) will be read from and written to a single **static `JSON` file** or browser `LocalStorage`/API sync.

### 👥 User Access & Security Model
* **Public Read-Only Dashboard:** The application is purely for visualization. Users **do not need to register or log in** to view the standings. Anyone with the URL can access it.
* **Simplified Admin Entry:** To input results, there is no admin user pool. Any user can click an "Edit/Update" button, enter the universal master password **`mundial2026`**, and instantly input or modify match scores and player goals via a simple form interface.
* **Real-time Leaderboard:** The leaderboard standings table must update dynamically on the frontend as soon as a new match score or goal is submitted and saved to the data store.

### 📊 Secondary Statistics Module
Beyond the main leaderboard, the UI must include a secondary view displaying:
1. **Top Scorers (Pichichi):** Ranking of the tournament players with the most goals.
2. **Team Performance:** Ranking of which national teams have generated the most points.
3. **Points Breakdown:** A detailed tool-tip or view per user showing exactly how many points came from their teams vs. their scorers.

---

## 📅 5. Full Tournament Fixtures (104 Matches Total)

#### Group Stage (72 Matches)
1. **Thu Jun 11 (21:00) | Group A:** Mexico vs South Africa — *Estadio Ciudad de México*
2. **Fri Jun 12 (04:00) | Group A:** South Korea vs Czechia — *Estadio Guadalajara*
3. **Fri Jun 12 (21:00) | Group B:** Canada vs Bosnia and Herzegovina — *Estadio de Toronto*
4. **Sat Jun 13 (03:00) | Group D:** USA vs Paraguay — *Estadio Los Angeles*
5. **Sat Jun 13 (21:00) | Group B:** Qatar vs Suiza — *Estadio de la Bahía de San Francisco*
6. **Sun Jun 14 (00:00) | Group C:** Brasil vs Marruecos — *Estadio Nueva York/Nueva Jersey*
7. **Sun Jun 14 (03:00) | Group C:** Haití vs Escocia — *Estadio Boston*
8. **Sun Jun 14 (06:00) | Group D:** Australia vs Turquía — *Estadio BC Place Vancouver*
9. **Sun Jun 14 (19:00) | Group E:** Alemania vs Curazao — *Estadio Houston*
10. **Sun Jun 14 (22:00) | Group F:** Países Bajos vs Japón — *Estadio Dallas*
11. **Mon Jun 15 (01:00) | Group E:** Costa de Marfil vs Ecuador — *Estadio Filadelfia*
12. **Mon Jun 15 (04:00) | Group F:** Suecia vs Túnez — *Estadio Monterrey*
13. **Mon Jun 15 (18:00) | Group H:** España vs Cabo Verde — *Estadio Atlanta*
14. **Mon Jun 15 (21:00) | Group G:** Bélgica vs Egipto — *Estadio de Seattle*
15. **Tue Jun 16 (00:00) | Group H:** Arabia Saudí vs Uruguay — *Estadio Miami*
16. **Tue Jun 16 (03:00) | Group G:** IR Irán vs Nueva Zelanda — *Estadio Los Angeles*
17. **Tue Jun 16 (21:00) | Group I:** Francia vs Senegal — *Estadio Nueva York/Nueva Jersey*
18. **Wed Jun 17 (00:00) | Group I:** Irak vs Noruega — *Estadio Boston*
19. **Wed Jun 17 (03:00) | Group J:** Argentina vs Algelia — *Estadio Kansas City*
20. **Wed Jun 17 (06:00) | Group J:** Austria vs Jordania — *Estadio de la Bahía de San Francisco*
21. **Wed Jun 17 (19:00) | Group K:** Portugal vs RD Congo — *Estadio Houston*
22. **Wed Jun 17 (22:00) | Group L:** Inglaterra vs Croacia — *Estadio Dallas*
23. **Thu Jun 18 (01:00) | Group L:** Ghana vs Panamá — *Estadio de Toronto*
24. **Thu Jun 18 (04:00) | Group K:** Uzbekistán vs Colombia — *Estadio Ciudad de México*
25. **Thu Jun 18 (18:00) | Group A:** Chequia vs Sudáfrica — *Estadio Atlanta*
26. **Thu Jun 18 (21:00) | Group B:** Suiza vs Bosnia y Herzegovina — *Estadio Los Angeles*
27. **Fri Jun 19 (00:00) | Group B:** Canadá vs Catar — *Estadio BC Place Vancouver*
28. **Fri Jun 19 (03:00) | Group A:** México vs South Korea — *Estadio Guadalajara*
29. **Fri Jun 19 (21:00) | Group D:** USA vs Australia — *Estadio de Seattle*
30. **Sat Jun 20 (00:00) | Group C:** Escocia vs Marruecos — *Estadio Boston*
31. **Sat Jun 20 (02:30) | Group C:** Brasil vs Haití — *Estadio Filadelfia*
32. **Sat Jun 20 (05:00) | Group D:** Turquía vs Paraguay — *Estadio de la Bahía de San Francisco*
33. **Sat Jun 20 (19:00) | Group F:** Países Bajos vs Suecia — *Estadio Houston*
34. **Sat Jun 20 (22:00) | Group E:** Alemania vs Costa de Marfil — *Estadio de Toronto*
35. **Sun Jun 21 (02:00) | Group E:** Ecuador vs Curazao — *Estadio Kansas City*
36. **Sun Jun 21 (06:00) | Group F:** Túnez vs Japón — *Estadio Monterrey*
37. **Sun Jun 21 (18:00) | Group H:** España vs Arabia Saudí — *Estadio Atlanta*
38. **Sun Jun 21 (21:00) | Group G:** Bélgica vs IR Irán — *Estadio Los Angeles*
39. **Mon Jun 22 (00:00) | Group H:** Uruguay vs Cabo Verde — *Estadio Miami*
40. **Mon Jun 22 (03:00) | Group G:** Nueva Zelanda vs Egipto — *Estadio BC Place Vancouver*
41. **Mon Jun 22 (19:00) | Group J:** Argentina vs Austria — *Estadio Dallas*
42. **Mon Jun 22 (23:00) | Group I:** Francia vs Irak — *Estadio Filadelfia*
43. **Tue Jun 23 (02:00) | Group I:** Noruega vs Senegal — *Estadio Nueva York/Nueva Jersey*
44. **Tue Jun 23 (05:00) | Group J:** Jordania vs Algelia — *Estadio de la Bahía de San Francisco*
45. **Tue Jun 23 (19:00) | Group K:** Portugal vs Uzbekistán — *Estadio Houston*
46. **Tue Jun 23 (22:00) | Group L:** Inglaterra vs Ghana — *Estadio Boston*
47. **Wed Jun 24 (01:00) | Group L:** Panamá vs Croacia — *Estadio de Toronto*
48. **Wed Jun 24 (04:00) | Group K:** Colombia vs RD Congo — *Estadio Guadalajara*
49. **Wed Jun 24 (21:00) | Group B:** Suiza vs Canadá — *Estadio BC Place Vancouver*
50. **Wed Jun 24 (21:00) | Group B:** Bosnia y Herzegovina vs Catar — *Estadio de Seattle*
51. **Thu Jun 25 (00:00) | Group C:** Escocia vs Brasil — *Estadio Miami*
52. **Thu Jun 25 (00:00) | Group C:** Marruecos vs Haití — *Estadio Atlanta*
53. **Thu Jun 25 (03:00) | Group A:** Chequia vs México — *Estadio Ciudad de México*
54. **Thu Jun 25 (03:00) | Group A:** Sudáfrica vs South Korea — *Estadio Monterrey*
55. **Thu Jun 25 (22:00) | Group E:** Curazao vs Costa de Marfil — *Estadio Filadelfia*
56. **Thu Jun 25 (22:00) | Group E:** Ecuador vs Alemania — *Estadio Nueva York/Nueva Jersey*
57. **Fri Jun 26 (01:00) | Group F:** Japón vs Suecia — *Estadio Dallas*
58. **Fri Jun 26 (01:00) | Group F:** Túnez vs Países Bajos — *Estadio Kansas City*
59. **Fri Jun 26 (04:00) | Group D:** Turquía vs USA — *Estadio Los Angeles*
60. **Fri Jun 26 (04:00) | Group D:** Paraguay vs Australia — *Estadio de la Bahía de San Francisco*
61. **Fri Jun 26 (21:00) | Group I:** Noruega vs Francia — *Estadio Boston*
62. **Fri Jun 26 (21:00) | Group I:** Senegal vs Irak — *Estadio de Toronto*
63. **Sat Jun 27 (02:00) | Group H:** Cabo Verde vs Arabia Saudí — *Estadio Houston*
64. **Sat Jun 27 (02:00) | Group H:** Uruguay vs España — *Estadio Guadalajara*
65. **Sat Jun 27 (05:00) | Group G:** Egipto vs IR Irán — *Estadio de Seattle*
66. **Sat Jun 27 (05:00) | Group G:** Nueva Zelanda vs Bélgica — *Estadio BC Place Vancouver*
67. **Sat Jun 27 (23:00) | Group L:** Panamá vs Inglaterra — *Estadio Nueva York/Nueva Jersey*
68. **Sat Jun 27 (23:00) | Group L:** Croacia vs Ghana — *Estadio Filadelfia*
69. **Sun Jun 28 (01:30) | Group K:** Colombia vs Portugal — *Estadio Miami*
70. **Sun Jun 28 (01:30) | Group K:** RD Congo vs Uzbekistán — *Estadio Atlanta*
71. **Sun Jun 28 (04:00) | Group J:** Argelia vs Austria — *Estadio Kansas City*
72. **Sun Jun 28 (04:00) | Group J:** Jordania vs Argentina — *Estadio Dallas*

#### Round of 32 (Dieciseisavos de final)
73. **Sun Jun 28 (21:00):** 2A vs 2B — *Estadio Los Angeles*
74. **Mon Jun 29 (19:00):** 1C vs 2F — *Estadio Houston*
75. **Mon Jun 29 (22:30):** 1E vs 3ABCDF — *Estadio Boston*
76. **Tue Jun 30 (03:00):** 1F vs 2C — *Estadio Monterrey*
77. **Tue Jun 30 (19:00):** 2E vs 2I — *Estadio Dallas*
78. **Tue Jun 30 (23:00):** 1I vs 3CDFGH — *Estadio Nueva York/Nueva Jersey*
79. **Wed Jul 01 (03:00):** 1A vs 3CEFHI — *Estadio Ciudad de México*
80. **Wed Jul 01 (18:00):** 1L vs 3EHIJK — *Estadio Atlanta*
81. **Wed Jul 01 (22:00):** 1G vs 3AEHIJ — *Estadio de Seattle*
82. **Thu Jul 02 (02:00):** 1D vs 3BEFIJ — *Estadio de la Bahía de San Francisco*
83. **Thu Jul 02 (21:00):** 1H vs 2J — *Estadio Los Angeles*
84. **Fri Jul 03 (01:00):** 2K vs 2L — *Estadio de Toronto*
85. **Fri Jul 03 (05:00):** 1B vs 3EFGIJ — *Estadio BC Place Vancouver*
86. **Fri Jul 03 (20:00):** 2D vs 2G — *Estadio Dallas*
87. **Sat Jul 04 (00:00):** 1J vs 2H — *Estadio Miami*
88. **Sat Jul 04 (03:30):** 1K vs 3DEIJL — *Estadio Kansas City*

#### Round of 16 (Octavos de final)
89. **Sat Jul 04 (19:00):** W73 vs W75 — *Estadio Houston*
90. **Sat Jul 04 (23:00):** W74 vs W77 — *Estadio Filadelfia*
91. **Sun Jul 05 (22:00):** W76 vs W78 — *Estadio Nueva York/Nueva Jersey*
92. **Mon Jul 06 (02:00):** W79 vs W80 — *Estadio Ciudad de México*
93. **Mon Jul 06 (21:00):** W83 vs W84 — *Estadio Dallas*
94. **Tue Jul 07 (02:00):** W81 vs W82 — *Estadio de Seattle*
95. **Tue Jul 07 (18:00):** W86 vs W88 — *Estadio Atlanta*
96. **Tue Jul 07 (22:00):** W85 vs W87 — *Estadio BC Place Vancouver*

#### Quarter-finals (Cuartos de final)
97. **Thu Jul 09 (22:00):** W89 vs W90 — *Estadio Boston*
98. **Fri Jul 10 (21:00):** W93 vs W94 — *Estadio Los Angeles*
99. **Sat Jul 11 (23:00):** W91 vs W92 — *Estadio Miami*
100. **Sun Jul 12 (03:00):** W95 vs W96 — *Estadio Kansas City*

#### Semi-finals (Semifinales)
101. **Tue Jul 14 (21:00):** W97 vs W98 — *Estadio Dallas*
102. **Wed Jul 15 (21:00):** W99 vs W100 — *Estadio Atlanta*

#### Third Place Play-off (Tercer puesto)
103. **Sat Jul 18 (23:00):** RU101 vs RU102 — *Estadio Miami*

#### World Cup Final (Final)
104. **Sun Jul 19 (21:00):** W101 vs W102 — *Estadio Nueva York/Nueva Jersey*

---

## 🗄️ 6. Seed Data / Official Assignments

### 1. IOKIN
* **🌍 Teams:** Canada, England, Morocco, South Africa
* **⚽ Scorers:** K. Mbappé (France), Raphinha (Brazil), Sorloth (Norway), M. Gregoritsch (Austria)

### 2. PIWI
* **🌍 Teams:** Brazil, Mexico, Australia, Qatar
* **⚽ Scorers:** Harry Kane (England), Julián Álvarez (Argentina), C. Pulisic (USA), Ferran Torres (Spain)

### 3. ISUSKO
* **🌍 Teams:** United States, Ecuador, Japan, Scotland
* **⚽ Scorers:** Lionel Messi (Argentina), Kai Havertz (Germany), Lois Openda (Belgium), Arda Güler (Turkey)

### 4. AMORRORTU
* **🌍 Teams:** Germany, Iran, Uruguay, Paraguay
* **⚽ Scorers:** Bukayo Saka (England), O. Dembélé (France), Bruno Fernandes (Portugal), F. Balogun (USA)

### 5. PENFOR
* **🌍 Teams:** Netherlands, Senegal, Ivory Coast, Czechia
* **⚽ Scorers:** Vinícius Jr. (Brazil), Y. En-Nesyri (Morocco), Viktor Gyökeres (Sweden), Patrik Schick (Czechia)

### 6. PLUTS
* **🌍 Teams:** Belgium, Austria, Tunisia, Bosnia and Herzegovina
* **⚽ Scorers:** Erling Haaland (Norway), Darwin Núñez (Uruguay), Florian Wirtz (Germany), Brahim Díaz (Morocco)

### 7. LUISON
* **🌍 Teams:** Spain, Colombia, Egypt, Turkey
* **⚽ Scorers:** Lamine Yamal (Spain), Cody Gakpo (Netherlands), Andrej Kramarić (Croatia), Alexander Isak (Sweden)

### 8. TXONTXE
* **🌍 Teams:** France, Croatia, Saudi Arabia, Sweden
* **⚽ Scorers:** Lautaro Martínez (Argentina), Cristiano Ronaldo (Portugal), Oyarzabal (Spain), Enner Valencia (Ecuador)

### 9. SOLA
* **🌍 Teams:** Argentina, South Korea, Norway, DR Congo
* **⚽ Scorers:** Romelu Lukaku (Belgium), Jamal Musiala (Germany), Jonathan David (Canada), Kaoru Mitoma (Japan)

### 10. POLACO
* **🌍 Teams:** Portugal, Switzerland, Algeria, Ghana
* **⚽ Scorers:** Santiago Giménez (Mexico), Luis Díaz (Colombia), Breel Embolo (Switzerland), Rafael Leão (Portugal)

---

## 📄 7. Core Data Store Blueprint (`data.json`)

To represent the complete data store state in a single file, follow this JSON scheme:

```json
{
  "players": [
    {
      "id": "IOKIN",
      "teams": ["Canada", "England", "Morocco", "South Africa"],
      "scorers": ["K. Mbappé", "Raphinha", "Sorloth", "M. Gregoritsch"]
    }
  ],
  "scorers_stats": {
    "K. Mbappé": { "team": "France", "goals": 0 },
    "Raphinha": { "team": "Brazil", "goals": 0 }
  },
  "matches": [
    {
      "id": 1,
      "stage": "Group Stage",
      "group": "A",
      "date": "2026-06-11",
      "time": "21:00",
      "home_team": "Mexico",
      "away_team": "South Africa",
      "home_score": null,
      "away_score": null,
      "stadium": "Estadio Ciudad de México",
      "status": "SCHEDULED" 
    }
  ]
}