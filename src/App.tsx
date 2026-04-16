import { memo } from 'react';
import { Undo2, Redo2, RotateCcw, BookOpen } from 'lucide-react';
import { HomeResetControl } from './components/HomeResetControl';
import { SmokeSimulation } from './components/SmokeSimulation';
import { VolumeControl } from './components/VolumeControl';
import { useNonogramGame } from './hooks/useNonogramGame';
import { HomeScreen } from './screens/HomeScreen';
import { PlayScreen } from './screens/PlayScreen';
import { VictoryModal } from './components/VictoryModal';
import { MountFujiBackground } from './components/MountFujiBackground';
import { ResetPuzzleModal } from './components/ResetPuzzleModal';

/**
 * Static decorative elements that never depend on game state.
 * Wrapped in memo so they are never re-rendered when the parent updates.
 */
const StaticDecorations = memo(function StaticDecorations() {
  return (
    <>
      <div className="oriental-bg" />
      <MountFujiBackground />
      <SmokeSimulation active={true} />
      <div className="bg-illustration-dragon" />
      <div className="bg-illustration-tiger" />
      <div className="bg-illustration-crane" />
      <div className="ink-brush" style={{ top: '-10%', left: '-10%' }} />
      <div className="ink-brush" style={{ bottom: '-10%', right: '-10%', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(201, 162, 39, 0.05) 0%, transparent 70%)' }} />

      {/* Decorative Lanterns */}
      <div className="lantern-wrapper lantern-pos-1">
        <div className="lantern-wire" />
        <div className="lantern">
          <div className="lantern-cap lantern-cap-top" />
          <span className="lantern-kanji">龍</span>
          <div className="lantern-cap lantern-cap-bottom" />
        </div>
        <div className="lantern-tassel" />
      </div>

      <div className="lantern-wrapper lantern-pos-2">
        <div className="lantern-wire" style={{ height: '80px' }} />
        <div className="lantern">
          <div className="lantern-cap lantern-cap-top" />
          <span className="lantern-kanji">福</span>
          <div className="lantern-cap lantern-cap-bottom" />
        </div>
        <div className="lantern-tassel" />
      </div>

      <div className="lantern-wrapper lantern-pos-3">
        <div className="lantern-wire" />
        <div className="lantern">
          <div className="lantern-cap lantern-cap-top" />
          <span className="lantern-kanji">虎</span>
          <div className="lantern-cap lantern-cap-bottom" />
        </div>
        <div className="lantern-tassel" />
      </div>

      <div className="lantern-wrapper lantern-pos-4">
        <div className="lantern-wire" style={{ height: '70px' }} />
        <div className="lantern">
          <div className="lantern-cap lantern-cap-top" />
          <span className="lantern-kanji">寿</span>
          <div className="lantern-cap lantern-cap-bottom" />
        </div>
        <div className="lantern-tassel" />
      </div>
    </>
  );
});

export default function App() {
  const game = useNonogramGame();
  const mainShellClassName = game.screen === 'play'
    ? 'w-full max-w-7xl flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2 md:px-6 pt-16 pb-4 md:pt-20 md:pb-6'
    : 'w-full max-w-6xl flex-1 flex flex-col px-2 md:px-12 py-14 md:py-24';

  return (
    <div
      className="min-h-screen text-[#fdf5e6] flex flex-col items-center relative overflow-hidden selection:bg-[#ae2012]/30"
      data-screen={game.screen}
    >
      <StaticDecorations />

      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-2 md:gap-3">
        {game.screen === 'home' && (
          <HomeResetControl
            canResetAllProgress={game.canResetAllProgress}
            onResetAllProgress={game.resetAllProgress}
          />
        )}
        {game.screen === 'home' && game.showTutorialShortcut && (
          <button
            onClick={game.startTutorial}
            className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg flex items-center justify-center relative z-10"
            title="Start tutorial"
            aria-label="Start tutorial"
          >
            <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
          </button>
        )}
        {game.screen === 'play' && (
          <>
            <button
              onClick={game.undo}
              disabled={!game.canUndo}
              className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#c9a227]/20 disabled:hover:bg-[#1a1510]/80 disabled:active:scale-100"
              title="Undo"
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
            </button>
            <button
              onClick={game.redo}
              disabled={!game.canRedo}
              className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#c9a227]/20 disabled:hover:bg-[#1a1510]/80 disabled:active:scale-100"
              title="Redo"
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
            </button>
            <button
              onClick={game.openResetPuzzleConfirm}
              className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
            </button>
          </>
        )}
        <VolumeControl
          muted={game.muted}
          volume={game.volume}
          onToggleMute={game.toggleMuted}
          onVolumeChange={game.changeVolume}
        />
      </div>

      <main className={mainShellClassName}>
        {game.screen === 'home' && (
          <HomeScreen
            completedIds={game.completedIds}
            inProgressIds={game.inProgressIds}
            continuePuzzleId={
              game.lastPlayedPuzzleId !== null && game.inProgressIds.includes(game.lastPlayedPuzzleId)
                ? game.lastPlayedPuzzleId
                : null
            }
            onStartPuzzle={game.startPuzzle}
            onStartTutorial={game.startTutorial}
            showTutorialCard={!game.showTutorialShortcut}
          />
        )}

        {game.screen === 'play' && game.gameState && (
          <PlayScreen
            gameState={game.gameState}
            inputMode={game.inputMode}
            onSetInputMode={game.setInputMode}
            onCellAction={game.handleCellAction}
            onBack={game.goHome}
            onDragStart={game.beginBatch}
            onDragEnd={game.endBatch}
          />
        )}
      </main>

      {game.screen === 'play' && game.showVictory && (
        <VictoryModal
          isLastPuzzle={game.isLastPuzzle}
          puzzleTitle={game.gameState?.puzzle.title ?? ''}
          puzzleWidth={game.gameState?.puzzle.width ?? 0}
          puzzleHeight={game.gameState?.puzzle.height ?? 0}
          elapsedTime={game.gameState?.elapsedTime ?? 0}
          onViewGrid={() => game.setShowVictory(false)}
          onNext={game.nextPuzzle}
        />
      )}

      {game.screen === 'play' && game.showResetPuzzleConfirm && (
        <ResetPuzzleModal
          onCancel={game.closeResetPuzzleConfirm}
          onConfirm={game.confirmResetPuzzle}
        />
      )}
    </div>
  );
}
