import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/puzzles', () => ({
  PUZZLES: [],
}));

import { HomeScreen } from './HomeScreen';

describe('HomeScreen empty puzzles', () => {
  it('handles zero puzzle count progress safely', () => {
    const { container } = render(<HomeScreen completedIds={[]} onStartPuzzle={() => {}} />);

    expect(screen.getByText('0/0')).toBeInTheDocument();
    const bar = container.querySelector('div[style="width: 0%;"]');
    expect(bar).toBeTruthy();
  });
});
