import { Volume2, VolumeX, Undo2, Redo2, RotateCcw } from 'lucide-react';
import { useNonogramGame } from './hooks/useNonogramGame';
import { HomeScreen } from './components/HomeScreen';
import { PlayScreen } from './components/PlayScreen';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const game = useNonogramGame();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdf5e6] flex flex-col items-center relative overflow-hidden selection:bg-[#ae2012]/30">
      <div className="oriental-bg" />
      <div className="ink-brush" style={{ top: '-10%', left: '-10%' }} />
      <div className="ink-brush" style={{ bottom: '-10%', right: '-10%', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(201, 162, 39, 0.05) 0%, transparent 70%)' }} />

      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-2 md:gap-3">
        {game.screen === 'play' && (
          <>
            <button
              onClick={game.undo}
              disabled={!game.canUndo}
              className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#c9a227]/20 disabled:hover:bg-[#1a1510]/80 disabled:active:scale-100"
              title="Undo"
            >
              <Undo2 className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
            </button>
            <button
              onClick={game.redo}
              disabled={!game.canRedo}
              className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#c9a227]/20 disabled:hover:bg-[#1a1510]/80 disabled:active:scale-100"
              title="Redo"
            >
              <Redo2 className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
            </button>
            <button
              onClick={game.reset}
              className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
            </button>
          </>
        )}
        <button
          onClick={() => game.setMuted(m => !m)}
          className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg"
          title={game.muted ? 'Unmute' : 'Mute'}
        >
          {game.muted ? (
            <VolumeX className="w-4 h-4 md:w-6 md:h-6 text-[#5a4d41]" />
          ) : (
            <Volume2 className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
          )}
        </button>
      </div>

      <main className="w-full max-w-6xl flex-1 flex flex-col px-2 md:px-12 py-14 md:py-24">
        {game.screen === 'home' && (
          <HomeScreen
            completedIds={game.completedIds}
            onStartPuzzle={game.startPuzzle}
          />
        )}

        {game.screen === 'play' && game.gameState && (
          <PlayScreen
            gameState={game.gameState}
            inputMode={game.inputMode}
            onSetInputMode={game.setInputMode}
            onCellAction={game.handleCellAction}
            onBack={game.goHome}
          />
        )}
      </main>

      {game.screen === 'play' && game.showVictory && (
        <VictoryModal
          isLastPuzzle={game.isLastPuzzle}
          onViewGrid={() => game.setShowVictory(false)}
          onNext={game.nextPuzzle}
        />
      )}
    </div>
  );
}
