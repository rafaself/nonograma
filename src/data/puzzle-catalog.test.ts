import { describe, expect, it } from 'vitest';
import {
  getNextPuzzleId,
  getPuzzleSummaryById,
  loadPuzzleById,
  preloadPuzzleCatalog,
  PUZZLES,
  TUTORIAL_PUZZLE,
} from './puzzle-catalog';

describe('puzzle catalog', () => {
  it('exports lightweight puzzle metadata for the main catalog', () => {
    expect(PUZZLES).toHaveLength(95);
    expect(PUZZLES[0]).toEqual({
      id: '5x5-1',
      title: 'Heart',
      width: 5,
      height: 5,
    });
  });

  it('looks up puzzle summaries by id', () => {
    expect(getPuzzleSummaryById('10x10-21')).toEqual({
      id: '10x10-21',
      title: 'Tiger',
      width: 10,
      height: 10,
    });
    expect(getPuzzleSummaryById('missing')).toBeNull();
  });

  it('resolves next puzzle ids and handles last or missing ids', () => {
    expect(getNextPuzzleId('5x5-1')).toBe('5x5-2');
    expect(getNextPuzzleId('20x20-20')).toBeNull();
    expect(getNextPuzzleId('missing')).toBeNull();
  });

  it('loads authored puzzles and tutorial data lazily', async () => {
    await preloadPuzzleCatalog();

    await expect(loadPuzzleById('15x15-15')).resolves.toMatchObject({
      id: '15x15-15',
      title: 'Dragon',
      width: 15,
      height: 15,
    });

    await expect(loadPuzzleById(TUTORIAL_PUZZLE.id)).resolves.toMatchObject({
      id: '4x4-1',
      title: 'Temple Lesson',
      tutorial: {
        summary: TUTORIAL_PUZZLE.tutorial.summary,
      },
    });
  });

  it('throws for unknown puzzle ids', async () => {
    await expect(loadPuzzleById('missing')).rejects.toThrow('Unknown puzzle id: missing');
  });
});
