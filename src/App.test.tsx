import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { CellState } from './lib/game-logic';

const useNonogramGameMock = vi.fn();

vi.mock('./hooks/useNonogramGame', () => ({
  useNonogramGame: () => useNonogramGameMock(),
}));

vi.mock('./screens/HomeScreen', () => ({
  HomeScreen: ({ onStartPuzzle }: { onStartPuzzle: () => void }) => (
    <button onClick={onStartPuzzle}>home-screen</button>
  ),
}));

vi.mock('./screens/PlayScreen', () => ({
  PlayScreen: ({ onBack, onCellAction, onSetInputMode }: { onBack: () => void; onCellAction: () => void; onSetInputMode: (m: CellState.FILLED | CellState.MARKED_X) => void }) => (
    <div>
      <button onClick={onBack}>play-back</button>
      <button onClick={onCellAction}>play-cell</button>
      <button onClick={() => onSetInputMode(CellState.MARKED_X)}>play-mode</button>
    </div>
  ),
}));

vi.mock('./components/VictoryModal', () => ({
  VictoryModal: ({ onViewGrid, onNext }: { onViewGrid: () => void; onNext: () => void }) => (
    <div>
      <button onClick={onViewGrid}>victory-view</button>
      <button onClick={onNext}>victory-next</button>
    </div>
  ),
}));

vi.mock('./components/VolumeControl', () => ({
  VolumeControl: ({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) => (
    <button onClick={onToggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
  ),
}));

describe('App', () => {
  it('renders home flow and mute toggle', () => {
    const startPuzzle = vi.fn();
    const toggleMuted = vi.fn();

    useNonogramGameMock.mockReturnValue({
      screen: 'home',
      gameState: null,
      inputMode: CellState.FILLED,
      setInputMode: vi.fn(),
      completedIds: [],
      showVictory: false,
      setShowVictory: vi.fn(),
      muted: false,
      volume: 0.5,
      toggleMuted,
      changeVolume: vi.fn(),
      startPuzzle,
      goHome: vi.fn(),
      nextPuzzle: vi.fn(),
      handleCellAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      reset: vi.fn(),
      canUndo: false,
      canRedo: false,
      isLastPuzzle: false,
    });

    render(<App />);

    fireEvent.click(screen.getByText('home-screen'));
    fireEvent.click(screen.getByRole('button', { name: 'Mute' }));

    expect(startPuzzle).toHaveBeenCalledTimes(1);
    expect(toggleMuted).toHaveBeenCalledTimes(1);
  });

  it('renders play controls and victory modal actions', () => {
    const undo = vi.fn();
    const redo = vi.fn();
    const reset = vi.fn();
    const goHome = vi.fn();
    const nextPuzzle = vi.fn();
    const setShowVictory = vi.fn();

    useNonogramGameMock.mockReturnValue({
      screen: 'play',
      gameState: {
        puzzle: { id: 'p', title: 'P', width: 1, height: 1, solution: [[true]] },
        clues: { rows: [[1]], cols: [[1]] },
        grid: [[CellState.EMPTY]],
        isSolved: false,
        elapsedTime: 0,
      },
      inputMode: CellState.FILLED,
      setInputMode: vi.fn(),
      completedIds: [],
      showVictory: true,
      setShowVictory,
      muted: true,
      volume: 0.5,
      toggleMuted: vi.fn(),
      changeVolume: vi.fn(),
      startPuzzle: vi.fn(),
      goHome,
      nextPuzzle,
      handleCellAction: vi.fn(),
      undo,
      redo,
      reset,
      canUndo: true,
      canRedo: true,
      isLastPuzzle: false,
    });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    fireEvent.click(screen.getByText('play-back'));
    fireEvent.click(screen.getByText('victory-view'));
    fireEvent.click(screen.getByText('victory-next'));

    expect(undo).toHaveBeenCalledTimes(1);
    expect(redo).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(goHome).toHaveBeenCalledTimes(1);
    expect(setShowVictory).toHaveBeenCalledWith(false);
    expect(nextPuzzle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
  });

});
