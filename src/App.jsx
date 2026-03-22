import { useState } from 'react';
import './index.css';
import MainMenu from './ui/MainMenu';
import Game from './components/Game';
import GameOver from './ui/GameOver';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [playerConfig, setPlayerConfig] = useState(null);

  const startGame = (configOrEvent) => {
    if (configOrEvent && !configOrEvent.nativeEvent) {
      setPlayerConfig(configOrEvent);
    }
    setScore(0);
    setGameState('playing');
    // Ensure the underlying running Phaser scene restarts as well
    if (gameState === 'gameover') {
      window.dispatchEvent(new CustomEvent('restartGame'));
    }
  };

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    setGameState('gameover');
  };

  const goToMenu = () => {
    setGameState('menu');
  };

  return (
    <>
      {gameState === 'menu' && <MainMenu onStart={startGame} />}
      {(gameState === 'playing' || gameState === 'gameover') && (
        <Game onGameOver={handleGameOver} config={playerConfig} />
      )}
      {gameState === 'gameover' && (
        <GameOver score={score} onRestart={startGame} onMenu={goToMenu} config={playerConfig} />
      )}
    </>
  );
}

export default App;
