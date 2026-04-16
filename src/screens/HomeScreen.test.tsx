import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeScreen } from './HomeScreen';

vi.mock('../data/puzzles', () => ({
  PUZZLES: [
    { id: 'a', title: 'Alpha', width: 5, height: 5, solution: [[true]] },
    { id: 'b', title: 'Beta', width: 5, height: 5, solution: [[true]] },
    { id: 'c', title: 'Gamma', width: 10, height: 10, solution: [[true]] },
  ],
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

describe('HomeScreen', () => {
  it('renders grouped puzzles, progress and starts puzzle', () => {
    const onStartPuzzle = vi.fn();
    const onStartTutorial = vi.fn();
    const { container } = render(
      <HomeScreen
        completedIds={['a']}
        onStartPuzzle={onStartPuzzle}
        onStartTutorial={onStartTutorial}
        showTutorialCard={true}
      />
    );

    expect(screen.getByText('Trail of the Panda')).toBeInTheDocument();
    expect(screen.getByText('Trail of the Tiger')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tutorial/i })).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getAllByText(/王+/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Alpha'));
    expect(onStartPuzzle).toHaveBeenCalledTimes(1);

    const bar = container.querySelector('div[style="width: 33%;"]');
    expect(bar).toBeTruthy();
  });

  it('starts the tutorial from the dedicated button', () => {
    const onStartPuzzle = vi.fn();
    const onStartTutorial = vi.fn();

    render(
      <HomeScreen
        completedIds={[]}
        onStartPuzzle={onStartPuzzle}
        onStartTutorial={onStartTutorial}
        showTutorialCard={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /start tutorial/i }));

    expect(onStartTutorial).toHaveBeenCalledTimes(1);
    expect(onStartPuzzle).not.toHaveBeenCalled();
  });

  it('hides the tutorial card when the compact shortcut is enabled', () => {
    render(
      <HomeScreen
        completedIds={['a']}
        onStartPuzzle={() => {}}
        onStartTutorial={() => {}}
        showTutorialCard={false}
      />
    );

    expect(screen.queryByRole('button', { name: /start tutorial/i })).not.toBeInTheDocument();
  });

  it('collapses and expands a size group', async () => {
    render(
      <HomeScreen
        completedIds={[]}
        onStartPuzzle={() => {}}
        onStartTutorial={() => {}}
        showTutorialCard={true}
      />
    );
    const headerLabel = screen.getAllByText('Trail of the Panda')[0];
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
