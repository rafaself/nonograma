import { Volume2, VolumeX } from 'lucide-react';
import { useNonogramGame } from './hooks/useNonogramGame';
import { HomeScreen } from './components/HomeScreen';
import { PlayScreen } from './components/PlayScreen';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const game = useNonogramGame();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">
      <div className="cyber-grid-bg" />
      <div className="floating-blob" style={{ top: '-10%', left: '-10%' }} />
      <div className="floating-blob" style={{ bottom: '-10%', right: '-10%', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)' }} />

      <button
        onClick={() => game.setMuted(m => !m)}
        className="fixed top-3 right-3 md:top-6 md:right-6 z-50 p-2.5 md:p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all active:scale-95"
        title={game.muted ? 'Unmute' : 'Mute'}
      >
        {game.muted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-zinc-500" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
      </button>

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
            onUndo={game.undo}
            onReset={game.reset}
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
