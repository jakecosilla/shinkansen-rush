import Phaser from 'phaser';
import MainPlayScene from './scenes/MainPlayScene';

const config = (width, height) => ({
  type: Phaser.AUTO,
  width: width,
  height: height,
  parent: 'game-container',
  transparent: true, // Transparent to show React background if needed
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false // False for production
    }
  },
  scene: [MainPlayScene]
});

export default config;
