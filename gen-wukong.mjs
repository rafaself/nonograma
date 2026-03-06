// Temporary helper: generate 10 new 20x20 Wukong trail puzzles
// Run with: node gen-wukong.mjs

function parseSolution(rows) {
  if (rows.length !== 20) throw new Error(`Expected 20 rows, got ${rows.length}`);
  return rows.map((r, i) => {
    const chars = [...r];
    if (chars.length !== 20) throw new Error(`Row ${i}: expected 20 cols, got ${chars.length}`);
    return chars.map(c => c === 'X');
  });
}

function mapGrid(solution, fn) {
  return solution.map((row, r) => row.map((val, c) => fn(r, c, val)));
}

function resultColors(solution, colorFn) {
  return mapGrid(solution, (r, c, filled) => filled ? colorFn(r, c) : null);
}

function bgColors(solution, colorFn) {
  return mapGrid(solution, (r, c, filled) => colorFn(r, c, filled));
}

const puzzles = [];

// ── 20x20-1: Staff (Ruyi Jingu Bang) ──
puzzles.push({
  id: '20x20-1', title: 'Staff',
  solution: parseSolution([
    '........XXXX........',
    '.......XXXXXX.......',
    '........XXXX........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '........XXXX........',
  ]),
  colorFn: (r, c) => {
    if (r <= 2 || r >= 17) return '#D4A017';
    if (r === 3 || r === 16) return '#B08968';
    return '#D4A017';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 5) return '#7F1D1D';
    if (r >= 14) return '#7F1D1D';
    return '#450A0A';
  },
});

// ── 20x20-2: Cloud (Somersault Cloud) ──
puzzles.push({
  id: '20x20-2', title: 'Cloud',
  solution: parseSolution([
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '......XXXXXXXX......',
    '....XXXXXXXXXXXX....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    '.XXXXXXXXXXXXXXXXXX.',
    '..XXXXXXXXXXXXXXXX..',
    '...XXXXXXXXXXXXXX...',
    '....XXXXXXXXXXXX....',
    '......XXXXXXXX......',
    '........XXXX........',
    '....................',
    '....................',
    '....................',
    '....................',
  ]),
  colorFn: (r, c) => {
    if (r <= 3) return '#F9FAFB';
    if (r <= 6) return '#E5E7EB';
    if (r <= 10) return '#D1D5DB';
    return '#9CA3AF';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 10) return '#3B82F6';
    if (r <= 15) return '#60A5FA';
    return '#93C5FD';
  },
});

// ── 20x20-3: Crown (Golden Headband) ──
puzzles.push({
  id: '20x20-3', title: 'Crown',
  solution: parseSolution([
    '....................',
    '..X....X....X....X..',
    '..XX..XXX..XXX..XX..',
    '..XXXXXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    '.XXXXXXXXXXXXXXXXXXX',
    '..XXXXXXXXXXXXXXXX..',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
  ]),
  colorFn: (r, c) => {
    if (r <= 2) return '#FBBF24';
    if (r <= 4) return '#D4A017';
    if (r <= 6) {
      if (c === 5 || c === 9 || c === 14) return '#E11D48';
      return '#A16207';
    }
    if (r === 7) return '#D4A017';
    return '#FBBF24';
  },
  bgFn: null,
});

// ── 20x20-4: Peach (Peaches of Immortality) ──
puzzles.push({
  id: '20x20-4', title: 'Peach',
  solution: parseSolution([
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '.....XXX..XXXX......',
    '....XXXX..XXXXX.....',
    '...XXXXXXXXXXXX.....',
    '..XXXXXXXXXXXXXXX...',
    '.XXXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXX..',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    '.XXXXXXXXXXXXXXXXX..',
    '..XXXXXXXXXXXXXXXX..',
    '...XXXXXXXXXXXXXX...',
    '....XXXXXXXXXXXX....',
    '......XXXXXXXX......',
    '........XXXX........',
    '.........XX.........',
    '....................',
  ]),
  colorFn: (r, c) => {
    if (r <= 2) return '#2D6A4F';
    if (r <= 4) {
      if (c <= 8) return '#FB7185';
      return '#E11D48';
    }
    if (r <= 6) return '#FB7185';
    if (r <= 10) return '#E11D48';
    if (r <= 14) return '#BE123C';
    return '#9F1239';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 5) return '#1D4E89';
    return '#2D6A4F';
  },
});

// ── 20x20-5: Monkey (Monkey Face) ──
puzzles.push({
  id: '20x20-5', title: 'Monkey',
  solution: parseSolution([
    '.....XXXXXXXXXX.....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXXXX',
    '.XXX..XXXXXX..XXXX..',
    'XXXX..XXXXXX..XXXX..',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    '.XXXXX.XXXXXX.XXXXX.',
    '..XXXX.XXXXXX.XXXX..',
    '..XXXXX......XXXXX..',
    '...XXXXXXXXXXXXXX...',
    '....XXXXXXXXXXXX....',
    '.....XXXXXXXXXX.....',
    '......XXXXXXXX......',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
  ]),
  colorFn: (r, c) => {
    if (r <= 1) return '#92400E';
    if (r <= 3) return '#B45309';
    if ((r === 4 || r === 5) && ((c >= 5 && c <= 6) || (c >= 13 && c <= 14))) return '#1F2937';
    if (r <= 7) return '#D97706';
    if ((r === 8 || r === 9) && (c === 6 || c === 13)) return '#1F2937';
    if (r >= 10 && r <= 13) return '#F6E27A';
    if (r === 14) return '#D97706';
    return '#B45309';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if ((r === 4 || r === 5) && ((c >= 5 && c <= 6) || (c >= 13 && c <= 14))) return '#F9FAFB';
    if ((r === 8 || r === 9) && (c === 6 || c === 13)) return '#F9FAFB';
    return '#1D4E89';
  },
});

// ── 20x20-6: Mountain (Five Elements Mountain) ──
puzzles.push({
  id: '20x20-6', title: 'Mountain',
  solution: parseSolution([
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '......XXXXXXXX......',
    '.....XXXXXXXXXX.....',
    '....XXXXXXXXXXXX....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
  ]),
  colorFn: (r, c) => {
    if (r <= 2) return '#F9FAFB';
    if (r <= 4) return '#E5E7EB';
    if (r <= 8) return '#6B7280';
    if (r <= 12) return '#4B5563';
    if (r <= 15) return '#374151';
    return '#2D6A4F';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 4) return '#1D4E89';
    if (r <= 8) return '#3B82F6';
    return null;
  },
});

// ── 20x20-7: Gourd (Magic Gourd) ──
puzzles.push({
  id: '20x20-7', title: 'Gourd',
  solution: parseSolution([
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '......XXXXXXXX......',
    '.......XXXXXX.......',
    '........XXXX........',
    '.......XXXXXX.......',
    '......XXXXXXXX......',
    '.....XXXXXXXXXX.....',
    '....XXXXXXXXXXXX....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '..XXXXXXXXXXXXXXXX..',
    '..XXXXXXXXXXXXXXXX..',
    '...XXXXXXXXXXXXXX...',
    '....XXXXXXXXXXXX....',
    '.....XXXXXXXXXX.....',
    '......XXXXXXXX......',
    '.......XXXXXX.......',
    '........XXXX........',
  ]),
  colorFn: (r, c) => {
    if (r <= 1) return '#A16207';
    if (r <= 4) return '#D97706';
    if (r === 5) return '#92400E';
    if (r <= 8) return '#F59E0B';
    if (r <= 12) return '#D97706';
    if (r <= 16) return '#B45309';
    return '#92400E';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    return '#7F1D1D';
  },
});

// ── 20x20-8: Lotus ──
puzzles.push({
  id: '20x20-8', title: 'Lotus',
  solution: parseSolution([
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '..XX..XXXXXXXX..XX..',
    '.XXXX.XXXXXXXX.XXXX.',
    'XXXXXXXXXXXXXXXXXXXXK'.slice(0,20),
    'XXXXXXXXXXXXXXXXXXXX',
    '.XXXX.XXXXXXXX.XXXX.',
    '..XX..XXXXXXXX..XX..',
    '.......XXXXXX.......',
    '......XXXXXXXX......',
    '.....XXXXXXXXXX.....',
    '....XXXXXXXXXXXX....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    '.XXXXXXXXXXXXXXXXXXX',
    '..XXXXXXXXXXXXXXXX..',
  ]),
  colorFn: (r, c) => {
    if (r <= 2) return '#F472B6';
    if (r <= 4) {
      if (c <= 3 || c >= 16) return '#EC4899';
      return '#F9A8D4';
    }
    if (r <= 6) return '#EC4899';
    if (r <= 8) {
      if (c <= 3 || c >= 16) return '#DB2777';
      return '#F472B6';
    }
    if (r <= 10) return '#059669';
    return '#047857';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 9) return '#1D4E89';
    return '#0F172A';
  },
});

// ── 20x20-9: Phoenix ──
puzzles.push({
  id: '20x20-9', title: 'Phoenix',
  solution: parseSolution([
    '......XXXXX.........',
    '....XXXXXXXXX.......',
    '...XXXXXXXXXXX......',
    '..XXXXXXXXXXXXX.....',
    '.XXXXXXXXXXXXXXX....',
    'XXXXXXXXXXXXXXXX....',
    'XXXXXXXXXXXXXXX.....',
    '.XXXXXXXXXXXXXX.....',
    '..XXXXXXXXXXXX.XX...',
    '...XXXXXXXXXX.XXXX..',
    '....XXXXXXXX.XXXXXX.',
    '.....XXXXXXX.XXXXXXX',
    '......XXXXX..XXXXXXX',
    '.......XXX...XXXXXXX',
    '........XX...XXXXXX.',
    '.........X....XXXXX.',
    '..............XXXX..',
    '..............XXX...',
    '..............XX....',
    '....................',
  ]),
  colorFn: (r, c) => {
    if (r <= 2) return '#E63941';
    if (r <= 5) {
      if (c <= 5) return '#F59E0B';
      return '#E63941';
    }
    if (r <= 8) return '#F97316';
    if (r <= 11) {
      if (c >= 13) return '#FBBF24';
      return '#D97706';
    }
    if (r <= 14) {
      if (c >= 13) return '#F59E0B';
      return '#E63941';
    }
    return '#D97706';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 7) return '#450A0A';
    return '#7F1D1D';
  },
});

// ── 20x20-10: Temple (Buddhist Temple) ──
puzzles.push({
  id: '20x20-10', title: 'Temple',
  solution: parseSolution([
    '.........XX.........',
    '........XXXX........',
    '.......XXXXXX.......',
    '......XXXXXXXX......',
    '.....XXXXXXXXXX.....',
    '....XXXXXXXXXXXX....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXXXX',
    '......XXXXXXXX......',
    '.....XXXXXXXXXX.....',
    '....XXXXXXXXXXXX....',
    '...XXXXXXXXXXXXXX...',
    '..XXXXXXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXX',
    'XXXX..XXXXXXXX..XXXX',
    'XXXX..XXXXXXXX..XXXX',
    'XXXX..XXX..XXX..XXXX',
    'XXXX..XXX..XXX..XXXX',
  ]),
  colorFn: (r, c) => {
    if (r <= 3) return '#D4A017';
    if (r <= 8) return '#B91C1C';
    if (r === 9) return '#D4A017';
    if (r <= 14) return '#B91C1C';
    if (r === 15) return '#B91C1C';
    if (r >= 16) {
      if ((c >= 4 && c <= 5) || (c >= 14 && c <= 15)) return null;
      if (c <= 3 || c >= 16) return '#F6E27A';
      if (r >= 18 && (c >= 9 && c <= 10)) return null;
      return '#8B5E34';
    }
    return '#B91C1C';
  },
  bgFn: (r, c, filled) => {
    if (filled) return null;
    if (r <= 8) return '#1D4E89';
    if (r <= 15) return '#3B82F6';
    return '#5FA8D3';
  },
});

// ── Generate output ──
const lines = puzzles.map(p => {
  const sol = p.solution;
  const rc = resultColors(sol, p.colorFn);
  const bc = p.bgFn ? bgColors(sol, p.bgFn) : null;

  const solStr = JSON.stringify(sol);
  const rcStr = JSON.stringify(rc);
  
  let entry = `    { id: '${p.id}', title: '${p.title}', width: 20, height: 20, solution: ${solStr}, resultColors: ${rcStr}`;
  if (bc) {
    entry += `, backgroundColors: ${JSON.stringify(bc)}`;
  }
  entry += ' },';
  return entry;
});

console.log(lines.join('\n'));
