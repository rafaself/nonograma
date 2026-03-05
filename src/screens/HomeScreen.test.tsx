import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeScreen } from './HomeScreen';

vi.mock('../data/puzzles', () => ({
  PUZZLES: [
    { id: 'a', title: 'Alpha', width: 5, height: 5, solution: [[true]] },
    { id: 'b', title: 'Beta', width: 5, height: 5, solution: [[true]] },
    { id: 'c', title: 'Gamma', width: 10, height: 10, solution: [[true]] },
  ],
}));

describe('HomeScreen', () => {
  it('renders grouped puzzles, progress and starts puzzle', () => {
    const onStartPuzzle = vi.fn();
    const { container } = render(<HomeScreen completedIds={['a']} onStartPuzzle={onStartPuzzle} />);

    expect(screen.getByText('5×5')).toBeInTheDocument();
    expect(screen.getByText('10×10')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getAllByText(/王+/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Alpha'));
    expect(onStartPuzzle).toHaveBeenCalledTimes(1);

    const bar = container.querySelector('div[style="width: 33%;"]');
    expect(bar).toBeTruthy();
  });

  it('collapses and expands a size group', async () => {
    render(<HomeScreen completedIds={[]} onStartPuzzle={() => {}} />);
    const headerLabel = screen.getAllByText('5×5')[0];
    const header = headerLabel.closest('button') as HTMLButtonElement;
    const section = header.closest('section') as HTMLElement;
    const collapse = section.querySelector('.collapse-grid') as HTMLElement;

    fireEvent.click(header);
    await waitFor(() => {
      expect(collapse.classList.contains('expanded')).toBe(false);
    });

    fireEvent.click(header);
    await waitFor(() => {
      expect(collapse.classList.contains('expanded')).toBe(true);
    });
  });
});
