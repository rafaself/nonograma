import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VictoryModal } from './VictoryModal';

describe('VictoryModal', () => {
  it('renders and triggers callbacks', () => {
    const onViewGrid = vi.fn();
    const onNext = vi.fn();

    render(
      <VictoryModal
        isLastPuzzle={false}
        puzzleTitle="Temple Path"
        puzzleWidth={15}
        puzzleHeight={15}
        elapsedTime={125}
        onViewGrid={onViewGrid}
        onNext={onNext}
      />,
    );

    expect(screen.getByText('Achieved')).toBeInTheDocument();
    expect(screen.getByText('Temple Path')).toBeInTheDocument();
    expect(screen.getByText('15x15 Trail')).toBeInTheDocument();
    expect(screen.getByText('Time 02:05')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review Trial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ascend Next' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Review Trial' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ascend Next' }));

    expect(onViewGrid).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows last puzzle label', () => {
    render(
      <VictoryModal
        isLastPuzzle
        puzzleTitle="Temple Path"
        puzzleWidth={15}
        puzzleHeight={15}
        elapsedTime={125}
        onViewGrid={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Final Peace' })).toBeInTheDocument();
  });
});
