#!/usr/bin/env node

/**
 * create-puzzle — Convert a visual .puzzle definition into TypeScript puzzle data.
 *
 * Usage:
 *   node .agents/skills/add-puzzle/scripts/create-puzzle.mjs <file.puzzle>             # Generate TS
 *   node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --preview <file.puzzle>   # Terminal preview
 *   node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --validate <file.puzzle>  # Validate only
 *   node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --next-id <WxH>          # Next available ID
 *
 * .puzzle file format:
 *
 *   title: Heart
 *
 *   palette:
 *     R = #e63941
 *     G = #2d6a4f
 *
 *   grid:
 *     .R.R.
 *     RRRRR
 *     RRRRR
 *     .RRR.
 *     ..R..
 *
 *   background:
 *     B = #1d4e89
 *
 *     BB.BB
 *     B...B
 *     .....
 *     BB.BB
 *     BB.BB
 *
 * Grid characters:
 *   .  = empty cell (solution: false)
 *   #  = filled cell with default gold color (#c9a227)
 *   A-Z = filled cell with the palette color mapped to that letter
 *
 * Background characters:
 *   .  = no background color
 *   A-Z = background color mapped to that letter
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..', '..');
const PUZZLES_PATH = resolve(PROJECT_ROOT, 'src/data/puzzles.ts');

const DEFAULT_COLOR = '#c9a227';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const ID_RE = /^\d+x\d+-\d+$/;

// ─── Clue derivation & win check (mirrors src/lib/game-logic.ts) ─────────────

function deriveClues(solution) {
  const height = solution.length;
  const width = solution[0].length;

  const rows = [];
  for (let r = 0; r < height; r++) {
    const clues = [];
    let count = 0;
    for (let c = 0; c < width; c++) {
      if (solution[r][c]) { count++; }
      else if (count > 0) { clues.push(count); count = 0; }
    }
    if (count > 0) clues.push(count);
    rows.push(clues.length > 0 ? clues : [0]);
  }

  const cols = [];
  for (let c = 0; c < width; c++) {
    const clues = [];
    let count = 0;
    for (let r = 0; r < height; r++) {
      if (solution[r][c]) { count++; }
      else if (count > 0) { clues.push(count); count = 0; }
    }
    if (count > 0) clues.push(count);
    cols.push(clues.length > 0 ? clues : [0]);
  }

  return { rows, cols };
}

function extractLineClues(line) {
  const clues = [];
  let count = 0;
  for (const cell of line) {
    if (cell === 1) { count++; }
    else if (count > 0) { clues.push(count); count = 0; }
  }
  if (count > 0) clues.push(count);
  return clues.length > 0 ? clues : [0];
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function checkWin(grid, clues) {
  const height = grid.length;
  const width = grid[0].length;

  for (let r = 0; r < height; r++) {
    if (!arraysEqual(extractLineClues(grid[r]), clues.rows[r])) return false;
  }
  for (let c = 0; c < width; c++) {
    const col = [];
    for (let r = 0; r < height; r++) col.push(grid[r][c]);
    if (!arraysEqual(extractLineClues(col), clues.cols[c])) return false;
  }
  return true;
}

// ─── Parse existing puzzle IDs from puzzles.ts ───────────────────────────────

function getExistingIds() {
  if (!existsSync(PUZZLES_PATH)) return [];
  const src = readFileSync(PUZZLES_PATH, 'utf-8');
  const matches = src.matchAll(/id:\s*'([^']+)'/g);
  return [...matches].map(m => m[1]);
}

function getNextId(sizeStr) {
  const match = sizeStr.match(/^(\d+)x(\d+)$/);
  if (!match) {
    throw new Error(`Invalid size format: "${sizeStr}". Expected WxH (e.g., 5x5, 10x10).`);
  }
  const prefix = `${match[1]}x${match[2]}-`;
  const ids = getExistingIds().filter(id => id.startsWith(prefix));
  const numbers = ids.map(id => parseInt(id.slice(prefix.length), 10)).filter(n => !isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${next}`;
}

// ─── .puzzle file parser ─────────────────────────────────────────────────────

function parsePuzzleFile(content) {
  const lines = content.split('\n');

  let title = '';
  let explicitId = '';
  const palette = {};
  const bgPalette = {};
  const gridLines = [];
  const bgLines = [];

  let section = 'header'; // header | palette | grid | background-palette | background

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    // Skip comments: // always, # only when followed by space (not grid data like "#####")
    if (trimmed.startsWith('//')) continue;
    if (trimmed.startsWith('# ') || trimmed === '#') continue;

    // Section headers
    if (trimmed.toLowerCase() === 'palette:') { section = 'palette'; continue; }
    if (trimmed.toLowerCase() === 'grid:') { section = 'grid'; continue; }
    if (trimmed.toLowerCase() === 'background:') { section = 'background-palette'; continue; }

    // Header fields
    if (section === 'header') {
      const titleMatch = trimmed.match(/^title:\s*(.+)$/i);
      if (titleMatch) { title = titleMatch[1].trim(); continue; }
      const idMatch = trimmed.match(/^id:\s*(.+)$/i);
      if (idMatch) { explicitId = idMatch[1].trim(); continue; }
      if (trimmed === '') continue;
      // If we hit non-empty non-header content, might be implicit palette/grid
      // Try to detect palette line
      if (/^[A-Z]\s*=\s*#[0-9a-fA-F]{6}$/.test(trimmed)) { section = 'palette'; }
      else if (/^[.#A-Z]+$/.test(trimmed)) { section = 'grid'; }
      else continue;
    }

    // Palette entries
    if (section === 'palette') {
      const paletteMatch = trimmed.match(/^([A-Z])\s*=\s*(#[0-9a-fA-F]{6})$/);
      if (paletteMatch) { palette[paletteMatch[1]] = paletteMatch[2].toLowerCase(); continue; }
      if (trimmed === '') continue;
      // Non-palette line in palette section → must be start of grid
      if (/^[.#A-Z]+$/.test(trimmed)) {
        section = 'grid';
      } else {
        continue;
      }
    }

    // Grid lines
    if (section === 'grid') {
      if (trimmed === '') continue;
      if (trimmed.toLowerCase() === 'background:') { section = 'background-palette'; continue; }
      gridLines.push(trimmed);
      continue;
    }

    // Background palette
    if (section === 'background-palette') {
      const paletteMatch = trimmed.match(/^([A-Z])\s*=\s*(#[0-9a-fA-F]{6})$/);
      if (paletteMatch) { bgPalette[paletteMatch[1]] = paletteMatch[2].toLowerCase(); continue; }
      if (trimmed === '') continue;
      if (/^[.A-Z]+$/.test(trimmed)) {
        section = 'background';
      } else {
        continue;
      }
    }

    // Background grid lines
    if (section === 'background') {
      if (trimmed === '') continue;
      bgLines.push(trimmed);
      continue;
    }
  }

  if (!title) throw new Error('Missing "title:" field.');
  if (gridLines.length === 0) throw new Error('No grid lines found.');

  // Validate grid dimensions
  const height = gridLines.length;
  const width = gridLines[0].length;
  if (width === 0) throw new Error('Grid rows cannot be empty.');
  if (width > 25 || height > 25) throw new Error(`Grid ${width}x${height} exceeds max 25x25.`);

  for (let r = 0; r < height; r++) {
    if (gridLines[r].length !== width) {
      throw new Error(`Grid row ${r + 1} has width ${gridLines[r].length}, expected ${width}.`);
    }
  }

  // Parse solution and resultColors from grid
  const solution = [];
  const resultColors = [];
  let hasCustomColors = false;

  for (let r = 0; r < height; r++) {
    const solRow = [];
    const colorRow = [];
    for (let c = 0; c < width; c++) {
      const ch = gridLines[r][c];
      if (ch === '.') {
        solRow.push(false);
        colorRow.push(null);
      } else if (ch === '#') {
        solRow.push(true);
        colorRow.push(DEFAULT_COLOR);
      } else if (/^[A-Z]$/.test(ch)) {
        if (!palette[ch]) throw new Error(`Grid cell (${r + 1},${c + 1}): palette color '${ch}' not defined.`);
        solRow.push(true);
        colorRow.push(palette[ch]);
        hasCustomColors = true;
      } else {
        throw new Error(`Grid cell (${r + 1},${c + 1}): invalid character '${ch}'. Use . # or A-Z.`);
      }
    }
    solution.push(solRow);
    resultColors.push(colorRow);
  }

  // Check at least one filled cell
  const filledCount = solution.flat().filter(Boolean).length;
  if (filledCount === 0) throw new Error('Puzzle has no filled cells.');

  // Parse background colors
  let backgroundColors = undefined;
  if (bgLines.length > 0) {
    if (bgLines.length !== height) {
      throw new Error(`Background grid has ${bgLines.length} rows, expected ${height}.`);
    }
    backgroundColors = [];
    for (let r = 0; r < height; r++) {
      if (bgLines[r].length !== width) {
        throw new Error(`Background row ${r + 1} has width ${bgLines[r].length}, expected ${width}.`);
      }
      const row = [];
      for (let c = 0; c < width; c++) {
        const ch = bgLines[r][c];
        if (ch === '.') {
          row.push(null);
        } else if (/^[A-Z]$/.test(ch)) {
          if (!bgPalette[ch]) throw new Error(`Background cell (${r + 1},${c + 1}): color '${ch}' not defined.`);
          row.push(bgPalette[ch]);
        } else {
          throw new Error(`Background cell (${r + 1},${c + 1}): invalid character '${ch}'. Use . or A-Z.`);
        }
      }
      backgroundColors.push(row);
    }
  }

  // Determine ID
  const sizeStr = `${width}x${height}`;
  let id;
  if (explicitId) {
    if (!ID_RE.test(explicitId)) throw new Error(`Invalid ID format: "${explicitId}". Must match WxH-N.`);
    id = explicitId;
  } else {
    id = getNextId(sizeStr);
  }

  return {
    id,
    title,
    width,
    height,
    solution,
    resultColors: hasCustomColors ? resultColors : resultColors,
    backgroundColors,
    filledCount,
    totalCells: width * height,
    palette,
    bgPalette,
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(puzzle) {
  const errors = [];

  // Solvability
  const clues = deriveClues(puzzle.solution);
  const candidateGrid = puzzle.solution.map(row =>
    row.map(cell => cell ? 1 : 0)
  );

  if (clues.rows.length !== puzzle.height) {
    errors.push(`Row clues count (${clues.rows.length}) != height (${puzzle.height}).`);
  }
  if (clues.cols.length !== puzzle.width) {
    errors.push(`Col clues count (${clues.cols.length}) != width (${puzzle.width}).`);
  }
  if (!checkWin(candidateGrid, clues)) {
    errors.push('Solvability check failed: solution does not satisfy derived clues.');
  }

  // Color validation
  for (let r = 0; r < puzzle.height; r++) {
    for (let c = 0; c < puzzle.width; c++) {
      const color = puzzle.resultColors[r][c];
      if (!puzzle.solution[r][c] && color !== null) {
        errors.push(`resultColors[${r}][${c}]: must be null for empty cell.`);
      }
      if (puzzle.solution[r][c] && (typeof color !== 'string' || !HEX_RE.test(color))) {
        errors.push(`resultColors[${r}][${c}]: invalid color "${color}".`);
      }
    }
  }

  if (puzzle.backgroundColors) {
    for (let r = 0; r < puzzle.height; r++) {
      for (let c = 0; c < puzzle.width; c++) {
        const color = puzzle.backgroundColors[r][c];
        if (color !== null && !HEX_RE.test(color)) {
          errors.push(`backgroundColors[${r}][${c}]: invalid color "${color}".`);
        }
      }
    }
  }

  // Check for duplicate ID
  const existingIds = getExistingIds();
  if (existingIds.includes(puzzle.id)) {
    errors.push(`Duplicate ID: "${puzzle.id}" already exists in puzzles.ts.`);
  }

  return errors;
}

// ─── Terminal preview with ANSI colors ───────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function ansiColor(hex, text) {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[48;2;${r};${g};${b}m${text}\x1b[0m`;
}

function preview(puzzle) {
  const { width, height, solution, resultColors, backgroundColors, id, title } = puzzle;

  console.log();
  console.log(`  ${title}  (${id})  ${width}x${height}  [${puzzle.filledCount}/${puzzle.totalCells} filled]`);
  console.log();

  // Column numbers header
  const colNums = '   ' + Array.from({ length: width }, (_, i) => String(i % 10)).join(' ');
  console.log(colNums);
  console.log('   ' + '--'.repeat(width));

  // Derive clues for display
  const clues = deriveClues(solution);

  for (let r = 0; r < height; r++) {
    let line = `${String(r).padStart(2)} `;
    for (let c = 0; c < width; c++) {
      if (solution[r][c]) {
        const color = resultColors[r][c] || DEFAULT_COLOR;
        line += ansiColor(color, '  ');
      } else if (backgroundColors?.[r]?.[c]) {
        line += ansiColor(backgroundColors[r][c], '  ');
      } else {
        line += '\x1b[48;2;30;30;30m  \x1b[0m';
      }
    }
    // Row clues
    line += `  ${clues.rows[r].join(' ')}`;
    console.log(line);
  }

  console.log('   ' + '--'.repeat(width));

  // Column clues (rotated)
  const maxColClueLen = Math.max(...clues.cols.map(c => c.length));
  for (let i = 0; i < maxColClueLen; i++) {
    let line = '   ';
    for (let c = 0; c < width; c++) {
      const colClue = clues.cols[c];
      const offset = maxColClueLen - colClue.length;
      if (i >= offset) {
        line += String(colClue[i - offset]).padStart(2);
      } else {
        line += '  ';
      }
    }
    console.log(line);
  }

  console.log();

  // Palette legend
  if (Object.keys(puzzle.palette).length > 0) {
    console.log('  Result palette:');
    for (const [key, color] of Object.entries(puzzle.palette)) {
      console.log(`    ${key} = ${ansiColor(color, '  ')} ${color}`);
    }
  }
  if (Object.keys(puzzle.bgPalette).length > 0) {
    console.log('  Background palette:');
    for (const [key, color] of Object.entries(puzzle.bgPalette)) {
      console.log(`    ${key} = ${ansiColor(color, '  ')} ${color}`);
    }
  }
  console.log();
}

// ─── TypeScript output generation ────────────────────────────────────────────

function toTsLiteral(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(toTsLiteral).join(',')}]`;
  }
  throw new Error(`Unsupported value type: ${typeof value}`);
}

function generateTs(puzzle) {
  const parts = [
    `id: '${puzzle.id}'`,
    `title: '${puzzle.title}'`,
    `solution: ${toTsLiteral(puzzle.solution)}`,
    `resultColors: ${toTsLiteral(puzzle.resultColors)}`,
  ];

  if (puzzle.backgroundColors) {
    parts.push(`backgroundColors: ${toTsLiteral(puzzle.backgroundColors)}`);
  }

  return `    { ${parts.join(', ')} },`;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
create-puzzle — Convert a visual .puzzle file into TypeScript puzzle data.

Usage:
  node create-puzzle.mjs <file.puzzle>             Generate TypeScript output
  node create-puzzle.mjs --preview <file.puzzle>   Colored terminal preview
  node create-puzzle.mjs --validate <file.puzzle>  Validate only
  node create-puzzle.mjs --next-id <WxH>           Show next available ID

Options:
  --preview    Show colored grid preview in terminal
  --validate   Validate without generating output
  --next-id    Print the next available puzzle ID for a given size (e.g., 5x5)
  --help       Show this help message

File format: See .agents/skills/add-puzzle/references/example.puzzle
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  // --next-id mode
  if (args.includes('--next-id')) {
    const idx = args.indexOf('--next-id');
    const size = args[idx + 1];
    if (!size) { console.error('Error: --next-id requires a size argument (e.g., 5x5).'); process.exit(1); }
    try {
      const nextId = getNextId(size);
      console.log(nextId);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Find the puzzle file
  const filePath = args.find(a => !a.startsWith('--'));
  if (!filePath) { console.error('Error: no .puzzle file specified.'); process.exit(1); }

  const resolvedPath = resolve(process.cwd(), filePath);
  if (!existsSync(resolvedPath)) {
    console.error(`Error: file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = readFileSync(resolvedPath, 'utf-8');

  let puzzle;
  try {
    puzzle = parsePuzzleFile(content);
  } catch (e) {
    console.error(`Parse error: ${e.message}`);
    process.exit(1);
  }

  // Validate
  const errors = validate(puzzle);

  if (args.includes('--validate')) {
    if (errors.length === 0) {
      console.log(`OK — "${puzzle.title}" (${puzzle.id}) is valid.`);
      console.log(`  Size: ${puzzle.width}x${puzzle.height}  Filled: ${puzzle.filledCount}/${puzzle.totalCells}`);
      preview(puzzle);
    } else {
      console.error(`INVALID — ${errors.length} error(s):`);
      errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }
    process.exit(0);
  }

  if (args.includes('--preview')) {
    if (errors.length > 0) {
      console.error(`Warning: ${errors.length} validation error(s):`);
      errors.forEach(e => console.error(`  - ${e}`));
    }
    preview(puzzle);
    process.exit(0);
  }

  // Default: generate TypeScript
  if (errors.length > 0) {
    console.error(`Validation failed — ${errors.length} error(s):`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  preview(puzzle);

  console.log('--- TypeScript output (add to RAW_PUZZLES in src/data/puzzles.ts) ---');
  console.log();
  console.log(generateTs(puzzle));
  console.log();
  console.log(`Assigned ID: ${puzzle.id}`);
  console.log();
  console.log('Next steps:');
  console.log('  1. Add the line above to the RAW_PUZZLES array in src/data/puzzles.ts');
  console.log('  2. Run: npx vitest run src/data/puzzles.test.ts src/data/puzzles-solvability.test.ts');
  console.log('  3. Run: pnpm build');
}

main();
