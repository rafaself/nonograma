import type { Puzzle, PuzzleTutorial } from '../lib/game-logic';

export interface PuzzleSummary {
  id: string;
  title: string;
  width: number;
  height: number;
}

interface TutorialSummary {
  summary: PuzzleTutorial['summary'];
}

export interface TutorialPuzzleSummary extends PuzzleSummary {
  tutorial: TutorialSummary;
}

export const PUZZLES: PuzzleSummary[] = [
  { id: '5x5-1', title: 'Heart', width: 5, height: 5 },
  { id: '5x5-2', title: 'Smiley', width: 5, height: 5 },
  { id: '5x5-3', title: 'Cross', width: 5, height: 5 },
  { id: '5x5-4', title: 'Square', width: 5, height: 5 },
  { id: '5x5-5', title: 'Tree', width: 5, height: 5 },
  { id: '5x5-6', title: 'Check', width: 5, height: 5 },
  { id: '5x5-7', title: 'Stairs', width: 5, height: 5 },
  { id: '5x5-8', title: 'Inv Stairs', width: 5, height: 5 },
  { id: '5x5-9', title: 'Diamond', width: 5, height: 5 },
  { id: '5x5-10', title: 'Plus', width: 5, height: 5 },
  { id: '5x5-11', title: 'Arrow U', width: 5, height: 5 },
  { id: '5x5-12', title: 'Arrow D', width: 5, height: 5 },
  { id: '5x5-13', title: 'Triangle', width: 5, height: 5 },
  { id: '5x5-14', title: 'Inv Tri', width: 5, height: 5 },
  { id: '5x5-15', title: 'Circle', width: 5, height: 5 },
  { id: '5x5-16', title: 'Leaf', width: 5, height: 5 },
  { id: '5x5-17', title: 'Wave', width: 5, height: 5 },
  { id: '5x5-18', title: 'Sun', width: 5, height: 5 },
  { id: '5x5-19', title: 'Moon', width: 5, height: 5 },
  { id: '5x5-20', title: 'Bamboo', width: 5, height: 5 },
  { id: '5x5-21', title: 'Tea', width: 5, height: 5 },
  { id: '5x5-22', title: 'Gate', width: 5, height: 5 },
  { id: '5x5-23', title: 'Bird', width: 5, height: 5 },
  { id: '5x5-24', title: 'Fish', width: 5, height: 5 },
  { id: '5x5-25', title: 'Lotus', width: 5, height: 5 },
  { id: '10x10-1', title: 'Cat', width: 10, height: 10 },
  { id: '10x10-2', title: 'House', width: 10, height: 10 },
  { id: '10x10-3', title: 'B Heart', width: 10, height: 10 },
  { id: '10x10-4', title: 'Smile', width: 10, height: 10 },
  { id: '10x10-5', title: 'Pine', width: 10, height: 10 },
  { id: '10x10-6', title: 'Boat', width: 10, height: 10 },
  { id: '10x10-7', title: 'Mushy', width: 10, height: 10 },
  { id: '10x10-8', title: 'Robot', width: 10, height: 10 },
  { id: '10x10-9', title: 'Spiral', width: 10, height: 10 },
  { id: '10x10-10', title: 'Stripes', width: 10, height: 10 },
  { id: '10x10-11', title: 'Goblet', width: 10, height: 10 },
  { id: '10x10-12', title: 'Skull', width: 10, height: 10 },
  { id: '10x10-13', title: 'Shield', width: 10, height: 10 },
  { id: '10x10-14', title: 'Umbrella', width: 10, height: 10 },
  { id: '10x10-15', title: 'Star', width: 10, height: 10 },
  { id: '10x10-16', title: 'Crane', width: 10, height: 10 },
  { id: '10x10-17', title: 'Fox', width: 10, height: 10 },
  { id: '10x10-18', title: 'Bridge', width: 10, height: 10 },
  { id: '10x10-19', title: 'Wave', width: 10, height: 10 },
  { id: '10x10-20', title: 'Maple', width: 10, height: 10 },
  { id: '10x10-21', title: 'Tiger', width: 10, height: 10 },
  { id: '10x10-22', title: 'Mask', width: 10, height: 10 },
  { id: '10x10-23', title: 'Drum', width: 10, height: 10 },
  { id: '10x10-24', title: 'Pagoda Roof', width: 10, height: 10 },
  { id: '10x10-25', title: 'Scroll', width: 10, height: 10 },
  { id: '15x15-1', title: 'Cactus', width: 15, height: 15 },
  { id: '15x15-2', title: 'Alien', width: 15, height: 15 },
  { id: '15x15-3', title: 'Fly', width: 15, height: 15 },
  { id: '15x15-4', title: 'Ring', width: 15, height: 15 },
  { id: '15x15-5', title: 'Mnt', width: 15, height: 15 },
  { id: '15x15-6', title: 'Torii', width: 15, height: 15 },
  { id: '15x15-7', title: 'Lantern', width: 15, height: 15 },
  { id: '15x15-8', title: 'Koi', width: 15, height: 15 },
  { id: '15x15-9', title: 'Pagoda', width: 15, height: 15 },
  { id: '15x15-10', title: 'Fan', width: 15, height: 15 },
  { id: '15x15-11', title: 'Katana', width: 15, height: 15 },
  { id: '15x15-12', title: 'Moon', width: 15, height: 15 },
  { id: '15x15-13', title: 'Bell', width: 15, height: 15 },
  { id: '15x15-14', title: 'Bonsai', width: 15, height: 15 },
  { id: '15x15-15', title: 'Dragon', width: 15, height: 15 },
  { id: '15x15-16', title: 'Sakura', width: 15, height: 15 },
  { id: '15x15-17', title: 'Kimono', width: 15, height: 15 },
  { id: '15x15-18', title: 'Shrine', width: 15, height: 15 },
  { id: '15x15-19', title: 'Kitsune', width: 15, height: 15 },
  { id: '15x15-20', title: 'Tortoise', width: 15, height: 15 },
  { id: '15x15-21', title: 'Bamboo Grove', width: 15, height: 15 },
  { id: '15x15-22', title: 'Sunrise', width: 15, height: 15 },
  { id: '15x15-23', title: 'Paper Crane', width: 15, height: 15 },
  { id: '15x15-24', title: 'Warrior Helm', width: 15, height: 15 },
  { id: '15x15-25', title: 'Temple Gate', width: 15, height: 15 },
  { id: '20x20-1', title: 'Labyrinth', width: 20, height: 20 },
  { id: '20x20-2', title: 'Cascade', width: 20, height: 20 },
  { id: '20x20-3', title: 'Shattered', width: 20, height: 20 },
  { id: '20x20-4', title: 'Circuits', width: 20, height: 20 },
  { id: '20x20-5', title: 'Weave', width: 20, height: 20 },
  { id: '20x20-6', title: 'Tetris', width: 20, height: 20 },
  { id: '20x20-7', title: 'Fractal', width: 20, height: 20 },
  { id: '20x20-8', title: 'Fortress', width: 20, height: 20 },
  { id: '20x20-9', title: 'Crosshatch', width: 20, height: 20 },
  { id: '20x20-10', title: 'Constellate', width: 20, height: 20 },
  { id: '20x20-11', title: 'Staff', width: 20, height: 20 },
  { id: '20x20-12', title: 'Cloud', width: 20, height: 20 },
  { id: '20x20-13', title: 'Crown', width: 20, height: 20 },
  { id: '20x20-14', title: 'Peach', width: 20, height: 20 },
  { id: '20x20-15', title: 'Monkey', width: 20, height: 20 },
  { id: '20x20-16', title: 'Mountain', width: 20, height: 20 },
  { id: '20x20-17', title: 'Gourd', width: 20, height: 20 },
  { id: '20x20-18', title: 'Lotus', width: 20, height: 20 },
  { id: '20x20-19', title: 'Phoenix', width: 20, height: 20 },
  { id: '20x20-20', title: 'Temple', width: 20, height: 20 },
];

export const TUTORIAL_PUZZLE: TutorialPuzzleSummary = {
  id: '4x4-1',
  title: 'Temple Lesson',
  width: 4,
  height: 4,
  tutorial: {
    summary: 'Learn the clue system on a guided 4x4 board with a few correct fills and X marks already in place.',
  },
};

const PUZZLES_BY_ID = new Map(PUZZLES.map((puzzle) => [puzzle.id, puzzle]));
const PUZZLE_INDEX_BY_ID = new Map(PUZZLES.map((puzzle, index) => [puzzle.id, index]));

let fullPuzzleCatalogPromise: Promise<typeof import('./puzzles')> | null = null;
let fullPuzzleByIdPromise: Promise<Map<string, Puzzle>> | null = null;

function loadPuzzleModule() {
  fullPuzzleCatalogPromise ??= import('./puzzles');
  return fullPuzzleCatalogPromise;
}

async function loadFullPuzzleByIdMap() {
  fullPuzzleByIdPromise ??= loadPuzzleModule().then(({ PUZZLES: fullPuzzles, TUTORIAL_PUZZLE: tutorialPuzzle }) => {
    const puzzleMap = new Map<string, Puzzle>(fullPuzzles.map((puzzle) => [puzzle.id, puzzle]));
    puzzleMap.set(tutorialPuzzle.id, tutorialPuzzle);
    return puzzleMap;
  });

  return fullPuzzleByIdPromise;
}

export function getPuzzleSummaryById(puzzleId: string): PuzzleSummary | null {
  return PUZZLES_BY_ID.get(puzzleId) ?? null;
}

export function getNextPuzzleId(currentPuzzleId: string): string | null {
  const currentIndex = PUZZLE_INDEX_BY_ID.get(currentPuzzleId);
  if (currentIndex === undefined || currentIndex >= PUZZLES.length - 1) {
    return null;
  }

  return PUZZLES[currentIndex + 1]?.id ?? null;
}

export async function loadPuzzleById(puzzleId: string): Promise<Puzzle> {
  const puzzleMap = await loadFullPuzzleByIdMap();
  const puzzle = puzzleMap.get(puzzleId);

  if (!puzzle) {
    throw new Error(`Unknown puzzle id: ${puzzleId}`);
  }

  return puzzle;
}

export async function preloadPuzzleCatalog(): Promise<void> {
  await loadFullPuzzleByIdMap();
}
