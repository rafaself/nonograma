import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/puzzles', () => ({
  PUZZLES: [],
  TUTORIAL_PUZZLE: {
    id: 'tutorial',
    title: 'Temple Lesson',
    width: 4,
    height: 4,
    solution: [[true]],
    tutorial: {
      summary: 'Learn the basics.',
      steps: ['One', 'Two', 'Three'],
    },
  },
}));

import { HomeScreen } from './HomeScreen';

describe('HomeScreen empty puzzles', () => {
  it('handles zero puzzle count progress safely', () => {
    const { container } = render(
      <HomeScreen
        completedIds={[]}
        onStartPuzzle={() => {}}
        onStartTutorial={() => {}}
        showTutorialCard={true}
      />
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tutorial/i })).toBeInTheDocument();
    const bar = container.querySelector('div[style="width: 0%;"]');
    expect(bar).toBeTruthy();
  });
});
