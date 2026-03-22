import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameConfig from '../game/GameConfig';
import HUD from './HUD';

const Game = ({ onGameOver, config }) => {
  const gameRef = useRef(null);
  const phaserGame = useRef(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    window.__PLAYER_CONFIG__ = config || { name: '', selectedTrain: 'hayabusa', birthday: '' };
    
    if (!gameRef.current) return;

    // Initialize Phaser
    const phaserConfig = GameConfig(gameRef.current.clientWidth, gameRef.current.clientHeight);
    phaserConfig.parent = gameRef.current;
    
    phaserGame.current = new Phaser.Game(phaserConfig);

    // Listen for custom events from Phaser scene
    const handleScoreUpdate = (event) => {
      setCurrentScore(event.detail.score);
      setSpeedMultiplier(event.detail.multiplier);
    };

    const handleCrash = (event) => {
      // Extended delay before showing game over to watch the huge confetti explosion!
      setTimeout(() => {
        if (onGameOverRef.current) onGameOverRef.current(event.detail.score);
      }, 3000);
    };

    window.addEventListener('updateScore', handleScoreUpdate);
    window.addEventListener('gameCrashed', handleCrash);

    // Provide a way to completely reset the current scene when restarting
    const handleRestart = () => {
      if (phaserGame.current) {
        // Just grab the running scene and restart it instead of destroying the whole game
        const scene = phaserGame.current.scene.getScene('MainPlayScene');
        if (scene) scene.scene.restart();
      }
    };
    window.addEventListener('restartGame', handleRestart);

    return () => {
      window.removeEventListener('updateScore', handleScoreUpdate);
      window.removeEventListener('gameCrashed', handleCrash);
      window.removeEventListener('restartGame', handleRestart);
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
      }
    };
  }, []); // Run only once when <Game /> is originally mounted!

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      <HUD score={currentScore} multiplier={speedMultiplier} />
    </div>
  );
};

export default Game;
