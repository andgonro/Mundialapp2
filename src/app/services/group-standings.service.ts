import { Injectable } from '@angular/core';
import { GroupStandingRow, Match, MatchSide } from '../models/game-data.model';

const ALL_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

/**
 * FIFA World Cup 2026 Regulations – predefined third-place bracket assignments.
 * Key: sorted qualifying group letters joined (e.g. 'BDEFIJKL').
 * Value: map of group letter → bracket slot code.
 * Source: FIFA World Cup 2026 Competition Regulations, Annex (third-place placement table).
 */
const FIFA_THIRD_PLACE_TABLE: Record<string, Record<string, string>> = {
  'ABCDEFGH': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'G': '3EFGIJ', 'H': '3DEIJL' },
  'ABCDEFGI': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'G': '3EFGIJ', 'I': '3DEIJL' },
  'ABCDEFGJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'G': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDEFGK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'G': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEFGL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'G': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEFHI': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'ABCDEFHJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDEFHK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEFHL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEFIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDEFIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEFIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEFJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEFJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEFKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'F': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEGHJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDEGHI': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'ABCDEGHK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEGJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEGHL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEGIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDEGIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEGIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEGJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEGKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'G': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDEHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDEIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDEJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'E': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFGHI': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'ABCDFGHJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDFGHK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDFGHL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFGIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDFGIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDFGIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFGJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDFGJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFGKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDFHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDFHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDFHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDFIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDFJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'F': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDGHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCDGHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDGHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDGHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDGHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDGHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDGIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDGIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDGIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDGJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCDHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCDIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'D': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFGHI': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'ABCEFGHJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'ABCEFGHK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEFGHL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFGIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCEFGIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEFGIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFGJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEFGJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFGKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCEFHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEFHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEFHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEFIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEFJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEGHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCEGHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEGHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEGHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEGHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEGHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEGIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEGIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEGIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEGJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCEHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCEIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'E': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFGHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABCFGHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABCFGHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFGHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCFGHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFGHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFGIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCFGIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFGIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFGJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCFHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCFIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCGHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABCGHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABCGHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCGHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCGIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABCHIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'C': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFGHI': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'ABDEFGHJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'ABDEFGHK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEFGHL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFGIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABDEFGIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEFGIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFGJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEFGJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFGKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABDEFHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEFHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEFHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEFIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEFJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEGHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABDEGHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEGHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEGHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEGHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEGHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEGIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEGIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEGIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEGJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDEHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDEIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFGHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABDFGHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABDFGHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFGHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDFGHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFGHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFGIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDFGIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFGIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFGJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDFHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDFIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDGHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABDGHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABDGHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDGHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDGIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABDHIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'D': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFGHIJ': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ABEFGHIK': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ABEFGHIL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFGHJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABEFGHJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFGHKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFGIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABEFGIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFGIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFGJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABEFHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEFIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEGHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABEGHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABEGHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEGHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEGIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABEHIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'E': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABFGHIJK': { 'A': '3ABCDF', 'B': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ABFGHIJL': { 'A': '3ABCDF', 'B': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ABFGHIKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABFGHJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABFGIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABFHIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ABGHIJKL': { 'A': '3ABCDF', 'B': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFGHI': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'ACDEFGHJ': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'ACDEFGHK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEFGHL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFGIJ': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ACDEFGIK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEFGIL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFGJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEFGJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFGKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFHIJ': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ACDEFHIK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEFHIL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFHJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEFHJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFHKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEFIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEFJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEGHIJ': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ACDEGHIK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEGHIL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEGHJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEGHJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEGHKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEGIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEGIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEGIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEGJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEHIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDEHIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEHIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEHJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDEIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFGHIJ': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ACDFGHIK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ACDFGHIL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFGHJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDFGHJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFGHKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFGIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDFGIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFGIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFGJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFHIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDFHIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFHIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFHJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDFIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDGHIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACDGHIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACDGHIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDGHJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDGIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACDHIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFGHIJ': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ACEFGHIK': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ACEFGHIL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFGHJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACEFGHJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFGHKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFGIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACEFGIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFGIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFGJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFHIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACEFHIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFHIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFHJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEFIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEGHIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACEGHIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACEGHIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEGHJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEGIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACEHIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACFGHIJK': { 'A': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ACFGHIJL': { 'A': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ACFGHIKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACFGHJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACFGIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACFHIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ACGHIJKL': { 'A': '3ABCDF', 'C': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFGHIJ': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'ADEFGHIK': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'ADEFGHIL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFGHJK': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ADEFGHJL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFGHKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFGIJK': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ADEFGIJL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFGIKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFGJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFHIJK': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ADEFHIJL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFHIKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFHJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEFIJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEGHIJK': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ADEGHIJL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ADEGHIKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEGHJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEGIJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADEHIJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADFGHIJK': { 'A': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'ADFGHIJL': { 'A': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'ADFGHIKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADFGHJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADFGIJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADFHIJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'ADGHIJKL': { 'A': '3ABCDF', 'D': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'AEFGHIJK': { 'A': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'AEFGHIJL': { 'A': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'AEFGHIKL': { 'A': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'AEFGHJKL': { 'A': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'AEFGIJKL': { 'A': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'AEFHIJKL': { 'A': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'AEGHIJKL': { 'A': '3ABCDF', 'E': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'AFGHIJKL': { 'A': '3ABCDF', 'F': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFGHI': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'I': '3DEIJL' },
  'BCDEFGHJ': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'J': '3DEIJL' },
  'BCDEFGHK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEFGHL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'H': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFGIJ': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'BCDEFGIK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEFGIL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFGJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEFGJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFGKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'G': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFHIJ': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'BCDEFHIK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEFHIL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFHJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEFHJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFHKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEFIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEFJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'F': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEGHIJ': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'BCDEGHIK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEGHIL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEGHJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEGHJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEGHKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEGIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEGIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEGIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEGJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEHIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDEHIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEHIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEHJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDEIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'E': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFGHIJ': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'BCDFGHIK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'BCDFGHIL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFGHJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDFGHJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFGHKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFGIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDFGIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFGIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFGJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFHIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDFHIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFHIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFHJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDFIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDGHIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCDGHIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCDGHIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDGHJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDGIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCDHIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'D': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFGHIJ': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'BCEFGHIK': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'BCEFGHIL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFGHJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCEFGHJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFGHKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFGIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCEFGIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFGIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFGJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFHIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCEFHIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFHIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFHJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEFIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEGHIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCEGHIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCEGHIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEGHJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEGIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCEHIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'E': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCFGHIJK': { 'B': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BCFGHIJL': { 'B': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BCFGHIKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCFGHJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCFGIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCFHIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BCGHIJKL': { 'B': '3ABCDF', 'C': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFGHIJ': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'BDEFGHIK': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'BDEFGHIL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFGHJK': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BDEFGHJL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFGHKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFGIJK': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BDEFGIJL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFGIKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFGJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFHIJK': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BDEFHIJL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFHIKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEFHJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  // *** THIS TOURNAMENT'S COMBINATION ***
  'BDEFIJKL': { 'D': '3ABCDF', 'F': '3CDFGH', 'E': '3CEFHI', 'K': '3EHIJK', 'I': '3AEHIJ', 'B': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BDEGHIJK': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BDEGHIJL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BDEGHIKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEGHJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEGIJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDEHIJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDFGHIJK': { 'B': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BDFGHIJL': { 'B': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BDFGHIKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDFGHJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDFGIJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDFHIJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BDGHIJKL': { 'B': '3ABCDF', 'D': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BEFGHIJK': { 'B': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'BEFGHIJL': { 'B': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'BEFGHIKL': { 'B': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BEFGHJKL': { 'B': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BEFGIJKL': { 'B': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BEFHIJKL': { 'B': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BEGHIJKL': { 'B': '3ABCDF', 'E': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'BFGHIJKL': { 'B': '3ABCDF', 'F': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFGHIJ': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'J': '3DEIJL' },
  'CDEFGHIK': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'K': '3DEIJL' },
  'CDEFGHIL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'I': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFGHJK': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'CDEFGHJL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFGHKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'H': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFGIJK': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'CDEFGIJL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFGIKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFGJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'G': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFHIJK': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'CDEFHIJL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFHIKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFHJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEFIJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'F': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEGHIJK': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'CDEGHIJL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'CDEGHIKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEGHJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEGIJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDEHIJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'E': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDFGHIJK': { 'C': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'CDFGHIJL': { 'C': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'CDFGHIKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDFGHJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDFGIJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDFHIJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CDGHIJKL': { 'C': '3ABCDF', 'D': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CEFGHIJK': { 'C': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'CEFGHIJL': { 'C': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'CEFGHIKL': { 'C': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CEFGHJKL': { 'C': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CEFGIJKL': { 'C': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CEFHIJKL': { 'C': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CEGHIJKL': { 'C': '3ABCDF', 'E': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'CFGHIJKL': { 'C': '3ABCDF', 'F': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'DEFGHIJK': { 'D': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'K': '3DEIJL' },
  'DEFGHIJL': { 'D': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'J': '3EFGIJ', 'L': '3DEIJL' },
  'DEFGHIKL': { 'D': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'I': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'DEFGHJKL': { 'D': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'H': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'DEFGIJKL': { 'D': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'G': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'DEFHIJKL': { 'D': '3ABCDF', 'E': '3CDFGH', 'F': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'DEGHIJKL': { 'D': '3ABCDF', 'E': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'DFGHIJKL': { 'D': '3ABCDF', 'F': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
  'EFGHIJKL': { 'E': '3ABCDF', 'F': '3CDFGH', 'G': '3CEFHI', 'H': '3EHIJK', 'I': '3AEHIJ', 'J': '3BEFIJ', 'K': '3EFGIJ', 'L': '3DEIJL' },
};

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
   * assigns each team to the correct bracket slot per the FIFA predefined lookup table.
   * Falls back to a backtracking DFS for combinations not in the table.
   * Returns a Map<slotCode, teamName>.
   */
  assignThirdPlaceSlots(
    qualifyingThirds: GroupStandingRow[],
    bracketSlots: ThirdPlaceBracketSlot[]
  ): Map<string, string> {
    const combinationKey = qualifyingThirds
      .map((t) => t.group)
      .sort()
      .join('');

    const lookup = FIFA_THIRD_PLACE_TABLE[combinationKey];
    if (lookup) {
      const result = new Map<string, string>();
      for (const team of qualifyingThirds) {
        const slotCode = lookup[team.group];
        if (slotCode) {
          result.set(slotCode, team.teamName);
        }
      }
      return result;
    }

    // Fallback: backtracking DFS for combinations not covered by the table
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
