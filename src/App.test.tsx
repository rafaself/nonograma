import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { CellState } from './lib/game-logic';

const useNonogramGameMock = vi.fn();
const smokeSimulationMock = vi.fn();

vi.mock('./hooks/useNonogramGame', () => ({
  useNonogramGame: () => useNonogramGameMock(),
}));

vi.mock('./screens/HomeScreen', () => ({
  HomeScreen: ({
    onStartPuzzle,
    onStartTutorial,
    showTutorialCard,
  }: {
    onStartPuzzle: () => void;
    onStartTutorial: () => void;
    showTutorialCard: boolean;
  }) => (
    <div>
      <button onClick={onStartPuzzle}>home-screen</button>
      {showTutorialCard ? (
        <button onClick={onStartTutorial}>home-tutorial-card</button>
      ) : (
        <span>tutorial-card-hidden</span>
      )}
    </div>
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

vi.mock('./components/SmokeSimulation', () => ({
  SmokeSimulation: (props: { active: boolean }) => {
    smokeSimulationMock(props);
    return <div data-testid="smoke-simulation" />;
  },
}));

describe('App', () => {
  beforeEach(() => {
    useNonogramGameMock.mockReset();
    smokeSimulationMock.mockClear();
  });

  it('keeps smoke active on all screens', () => {
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
      toggleMuted: vi.fn(),
      changeVolume: vi.fn(),
      startPuzzle: vi.fn(),
      startTutorial: vi.fn(),
      goHome: vi.fn(),
      nextPuzzle: vi.fn(),
      handleCellAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      reset: vi.fn(),
      resetAllProgress: vi.fn(),
      canUndo: false,
      canRedo: false,
      canResetAllProgress: false,
      isLastPuzzle: false,
      showTutorialShortcut: false,
    });

    const { rerender } = render(<App />);
    expect(smokeSimulationMock).toHaveBeenLastCalledWith({ active: true });

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
      showVictory: false,
      setShowVictory: vi.fn(),
      muted: false,
      volume: 0.5,
      toggleMuted: vi.fn(),
      changeVolume: vi.fn(),
      startPuzzle: vi.fn(),
      startTutorial: vi.fn(),
      goHome: vi.fn(),
      nextPuzzle: vi.fn(),
      handleCellAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      reset: vi.fn(),
      resetAllProgress: vi.fn(),
      canUndo: false,
      canRedo: false,
      canResetAllProgress: false,
      isLastPuzzle: false,
      showTutorialShortcut: false,
    });

    rerender(<App />);
    expect(smokeSimulationMock).toHaveBeenLastCalledWith({ active: true });
  });

  it('renders home flow and mute toggle', () => {
    const startPuzzle = vi.fn();
    const startTutorial = vi.fn();
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
      startTutorial,
      goHome: vi.fn(),
      nextPuzzle: vi.fn(),
      handleCellAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      reset: vi.fn(),
      resetAllProgress: vi.fn(),
      canUndo: false,
      canRedo: false,
      canResetAllProgress: true,
      isLastPuzzle: false,
      showTutorialShortcut: false,
    });

    render(<App />);

    fireEvent.click(screen.getByText('home-screen'));
    fireEvent.click(screen.getByText('home-tutorial-card'));
    fireEvent.click(screen.getByRole('button', { name: 'Mute' }));

    expect(startPuzzle).toHaveBeenCalledTimes(1);
    expect(startTutorial).toHaveBeenCalledTimes(1);
    expect(toggleMuted).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Reset all progress' })).toBeInTheDocument();
  });

  it('shows the compact tutorial shortcut on the home toolbar after progress is unlocked', () => {
    const startTutorial = vi.fn();

    useNonogramGameMock.mockReturnValue({
      screen: 'home',
      gameState: null,
      inputMode: CellState.FILLED,
      setInputMode: vi.fn(),
      completedIds: ['a'],
      showVictory: false,
      setShowVictory: vi.fn(),
      muted: false,
      volume: 0.5,
      toggleMuted: vi.fn(),
      changeVolume: vi.fn(),
      startPuzzle: vi.fn(),
      startTutorial,
      goHome: vi.fn(),
      nextPuzzle: vi.fn(),
      handleCellAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      reset: vi.fn(),
      resetAllProgress: vi.fn(),
      canUndo: false,
      canRedo: false,
      canResetAllProgress: true,
      isLastPuzzle: false,
      showTutorialShortcut: true,
    });

    render(<App />);

    expect(screen.queryByText('home-tutorial-card')).not.toBeInTheDocument();
    expect(screen.getByText('tutorial-card-hidden')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start tutorial' }));

    expect(startTutorial).toHaveBeenCalledTimes(1);
  });

  it('renders the home reset control only on the home screen', () => {
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
      showVictory: false,
      setShowVictory: vi.fn(),
      muted: false,
      volume: 0.5,
      toggleMuted: vi.fn(),
      changeVolume: vi.fn(),
      startPuzzle: vi.fn(),
      startTutorial: vi.fn(),
      goHome: vi.fn(),
      nextPuzzle: vi.fn(),
      handleCellAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      reset: vi.fn(),
      resetAllProgress: vi.fn(),
      canUndo: false,
      canRedo: false,
      canResetAllProgress: true,
      isLastPuzzle: false,
      showTutorialShortcut: false,
    });

    render(<App />);

    expect(screen.queryByRole('button', { name: 'Reset all progress' })).not.toBeInTheDocument();
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
      startTutorial: vi.fn(),
      goHome,
      nextPuzzle,
      handleCellAction: vi.fn(),
      undo,
      redo,
      reset,
      resetAllProgress: vi.fn(),
      canUndo: true,
      canRedo: true,
      canResetAllProgress: true,
      isLastPuzzle: false,
      showTutorialShortcut: false,
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
