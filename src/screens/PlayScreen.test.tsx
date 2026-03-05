import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CellState, type GameState } from '../lib/game-logic';
import { PlayScreen } from './PlayScreen';

const canvasPropsSpy = vi.fn();

vi.mock('../components/NonogramBoardCanvas', () => ({
  NonogramBoardCanvas: (props: {
    onCellAction: (r: number, c: number, action: 'fill' | 'mark_x') => void;
    resultColors?: (string | null)[][];
    backgroundColors?: (string | null)[][];
  }) => {
    canvasPropsSpy(props);
    return (
      <div>
        <button onClick={() => props.onCellAction(1, 2, 'fill')}>fill cell</button>
        <button onClick={() => props.onCellAction(3, 4, 'mark_x')}>mark cell</button>
      </div>
    );
  },
}));

const gameState: GameState = {
  puzzle: {
    id: 'p',
    title: 'P',
    width: 1,
    height: 1,
    solution: [[true]],
    resultColors: [['#111']],
    backgroundColors: [['#1d4e89']],
  },
  clues: {
    rows: [[1]],
    cols: [[1]],
  },
  grid: [[CellState.EMPTY]],
  isSolved: false,
  elapsedTime: 0,
};

describe('PlayScreen', () => {
  it('forwards color grids only when present', () => {
    canvasPropsSpy.mockClear();
    const { resultColors: _resultColors, backgroundColors: _backgroundColors, ...puzzleWithoutColors } = gameState.puzzle;

    const noColorsState: GameState = {
      ...gameState,
      puzzle: puzzleWithoutColors,
    };

    const { unmount } = render(
      <PlayScreen
        gameState={noColorsState}
        inputMode={CellState.FILLED}
        onSetInputMode={() => {}}
        onCellAction={() => {}}
        onBack={() => {}}
      />,
    );

    const lastCallProps = canvasPropsSpy.mock.calls.at(-1)?.[0] as {
      resultColors?: (string | null)[][];
      backgroundColors?: (string | null)[][];
    };
    expect(lastCallProps.resultColors).toBeUndefined();
    expect(lastCallProps.backgroundColors).toBeUndefined();
    unmount();
  });

  it('maps board actions and handles mode toggle/back', () => {
    const onBack = vi.fn();
    const onCellAction = vi.fn();
    const onSetInputMode = vi.fn();

    render(
      <PlayScreen
        gameState={gameState}
        inputMode={CellState.FILLED}
        onSetInputMode={onSetInputMode}
        onCellAction={onCellAction}
        onBack={onBack}
      />,
    );

    fireEvent.click(screen.getByText('fill cell'));
    fireEvent.click(screen.getByText('mark cell'));
    fireEvent.click(screen.getByRole('button', { name: 'Switch to mark mode' }));
    fireEvent.click(screen.getByRole('button', { name: /return to trails/i }));

    expect(onCellAction).toHaveBeenNthCalledWith(1, 1, 2, 0);
    expect(onCellAction).toHaveBeenNthCalledWith(2, 3, 4, 2);
    expect(onSetInputMode).toHaveBeenCalledWith(CellState.MARKED_X);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('toggles back to fill mode from mark mode', () => {
    const onSetInputMode = vi.fn();

    render(
      <PlayScreen
        gameState={gameState}
        inputMode={CellState.MARKED_X}
        onSetInputMode={onSetInputMode}
        onCellAction={() => {}}
        onBack={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Switch to fill mode' }));
    expect(onSetInputMode).toHaveBeenCalledWith(CellState.FILLED);
  });
});
