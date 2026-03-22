import Phaser from 'phaser';
import { TrainSVGs } from '../TrainAssets';

export default class MainPlayScene extends Phaser.Scene {
  constructor() {
    super('MainPlayScene');
  }

  preload() {
    this.trainModels = Object.keys(TrainSVGs);
    this.trainModels.forEach(model => {
      // Decode SVG 
      const b64 = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(TrainSVGs[model])));
      this.load.svg(model, b64, { width: 40, height: 180 });
    });
    
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Generate a tileable track texture
    // Assuming a standard width of 1200 or dynamic. For preload, we estimate lane width.
    const width = this.sys.game.config.width;
    const laneWidth = width / 5;
    const tileH = 100;

    // Gravel/Ballast base
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(0, 0, laneWidth, tileH);

    // Gravel noise
    graphics.fillStyle(0xaaaaaa, 1);
    for(let i = 0; i < 60; i++) {
      graphics.fillRect(Phaser.Math.Between(0, laneWidth), Phaser.Math.Between(0, tileH), 4, 4);
    }

    // Concrete Sleepers (ties)
    graphics.fillStyle(0xeeeeee, 1);
    for(let y = 10; y < tileH; y += 25) {
      graphics.fillRect(laneWidth * 0.15, y, laneWidth * 0.7, 8);
    }

    // Metal Rails
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(laneWidth * 0.25, 0, 8, tileH); // Left rail
    graphics.fillRect(laneWidth * 0.75 - 8, 0, 8, tileH); // Right rail

    graphics.generateTexture('track_lane', laneWidth, tileH);
    graphics.clear();

    // Tree Graphics
    graphics.fillStyle(0x115522, 1);
    graphics.fillCircle(20, 20, 18);
    graphics.fillStyle(0x1a7431, 1);
    graphics.fillCircle(25, 12, 12);
    graphics.fillStyle(0x0a3311, 1);
    graphics.fillCircle(10, 25, 12);
    graphics.generateTexture('tree', 40, 40);
    graphics.clear();
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('boost', 30, 30);
    graphics.clear();
    
    // Cake Graphic
    graphics.fillStyle(0xffaabb, 1);
    graphics.fillRect(0, 15, 30, 15); // Base
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 10, 30, 5); // Frosting
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(13, 0, 4, 10); // Candle
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(15, 0, 4); // Flame
    graphics.generateTexture('cake', 30, 30);
    graphics.clear();
    
    // Left Station platform
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(0, 0, 80, 400); 
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(70, 0, 5, 400); // Warning line
    graphics.fillStyle(0x0077b6, 1); // Blue roof
    graphics.fillRect(10, 20, 50, 360);
    graphics.generateTexture('station_left', 80, 400);
    graphics.clear();

    // Right Station platform
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(0, 0, 80, 400); 
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(5, 0, 5, 400); // Warning line
    graphics.fillStyle(0x0077b6, 1); // Blue roof
    graphics.fillRect(20, 20, 50, 360);
    graphics.generateTexture('station_right', 80, 400);
    graphics.clear();
    
    // Establishments / Landmarks
    // 1. Don Quijote Building
    graphics.fillStyle(0x002ca1, 1); // Blue building
    graphics.fillRect(0, 40, 60, 120);
    graphics.fillStyle(0xffff00, 1); // Yellow sign on top
    graphics.fillRect(5, 10, 50, 30);
    graphics.fillStyle(0xff0000, 1); // Fake red kanji/text blob
    graphics.fillRect(15, 15, 30, 20);
    graphics.generateTexture('donki', 60, 160);
    graphics.clear();

    // 2. Maglev Museum
    graphics.fillStyle(0xffffff, 1); // White base
    graphics.fillRect(0, 40, 120, 50);
    graphics.fillStyle(0x0077b6, 1); // Ocean blue stripe
    graphics.fillRect(0, 50, 120, 10);
    graphics.fillStyle(0xdddddd, 1); // Silver dome
    graphics.fillCircle(60, 40, 30);
    graphics.generateTexture('maglev_museum', 120, 90);
    graphics.clear();

    // 3. Skytree (Extremely tall needle, gray/silver)
    graphics.fillStyle(0x888888, 1); // Gray needle
    graphics.fillRect(25, 0, 10, 250); 
    graphics.fillStyle(0x555555, 1); // Darker gray base instead of cyan
    graphics.fillRect(20, 120, 20, 130);
    graphics.fillStyle(0xbbbbbb, 1); // Light gray Deck 1
    graphics.fillCircle(30, 40, 15);
    graphics.fillCircle(30, 80, 25); // Deck 2
    graphics.generateTexture('skytree', 60, 250);
    graphics.clear();

    // 4. Tokyo Tower (Red and White A-frame)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillTriangle(30, 0, 5, 200, 55, 200); // Red Base
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(30, 40, 20, 100, 40, 100); // White Stripe 1
    graphics.fillTriangle(30, 130, 12, 170, 48, 170); // White Stripe 2
    graphics.generateTexture('tokyo_tower', 60, 200);
    graphics.clear();
  }

  create() {
    this.width = this.cameras.main.width;
    this.height = this.cameras.main.height;
    
    // Game variables
    this.isPlaying = true;
    this.score = 0;
    this.baseSpeed = 400; // pixels per second moving down
    this.speedMultiplier = 1;
    this.boostTimer = 0;
    
    // Lane configuration
    this.laneWidth = this.width / 5; // 3 lanes, but centered with padding
    this.lanePositions = [
      this.width / 2 - this.laneWidth, // Left
      this.width / 2,                  // Center
      this.width / 2 + this.laneWidth  // Right
    ];
    this.currentLane = 1; // Center lane

    // Grass background
    this.cameras.main.setBackgroundColor('#8dc63f');

    // Add scrolling tracks
    this.trackTiles = [];
    this.lanePositions.forEach(x => {
      const tile = this.add.tileSprite(x, this.height / 2, this.laneWidth, this.height, 'track_lane');
      tile.setDepth(0);
      this.trackTiles.push(tile);
    });

    // Trees group
    this.trees = this.physics.add.group();
    
    // Stations group
    this.stations = this.physics.add.group();
    
    this.lastBuildingSpawn = 0; // Cooldown timer tracking

    // Setup Config
    const config = window.__PLAYER_CONFIG__ || {};
    const playerTrainModel = config.selectedTrain || Phaser.Utils.Array.GetRandom(this.trainModels);

    // Player
    this.player = this.physics.add.sprite(
      this.lanePositions[this.currentLane], 
      this.height - 200, 
      playerTrainModel
    );
    this.player.setDepth(10);
    // Since it's 3 cars, the hit box shouldn't be the full height or it feels unfair.
    // Let's make only the front car have collision logic! 
    this.player.body.setSize(30, 60);
    this.player.body.setOffset(5, 0); // Front of the player train is collision
    
    // Obstacles group
    this.obstacles = this.physics.add.group();

    // Inputs
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-LEFT', () => this.moveLane(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveLane(1));
    this.input.keyboard.on('keydown-UP', () => this.activateBoost());
    this.input.keyboard.on('keydown-DOWN', () => this.activateBrake());
    
    // Swipe for mobile
    this.input.on('pointerdown', (pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
    });
    
    this.input.on('pointerup', (pointer) => {
      if (!this.swipeStartX || !this.swipeStartY) return;
      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;
      const swipeThreshold = 50;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
        if (dx > 0) this.moveLane(1);
        else this.moveLane(-1);
      } else if (Math.abs(dy) > swipeThreshold) {
        if (dy < 0) this.activateBoost();
        else this.activateBrake();
      }
      this.swipeStartX = null;
      this.swipeStartY = null;
    });

    // Collision
    this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
    
    // Timers
    this.obstacleTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });
    
    this.difficultyTimer = this.time.addEvent({
      delay: 5000,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true
    });
    
    this.treeTimer = this.time.addEvent({
      delay: 450, // Slightly slower so we don't overcrowd with massive towers
      callback: this.spawnEnvironment,
      callbackScope: this,
      loop: true
    });
    
    this.stationTimer = this.time.addEvent({
      delay: 8000, // spawn a station every 8 seconds
      callback: this.spawnStation,
      callbackScope: this,
      loop: true
    });

    // Birthday Logic - ONLY showing if today's Month-Day exactly matches the input Birthday
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${mm}-${dd}`;
    
    let isBirthday = false;
    if (config.birthday && config.birthday.length >= 5) {
      if (config.birthday.substring(5) === todayStr) {
        isBirthday = true;
      }
    }

    if (isBirthday) {
       this.cake = this.add.sprite(this.player.x, this.player.y - 30, 'cake');
       this.cake.setDepth(11);
    }
  }

  moveLane(dir) {
    if (!this.isPlaying) return;
    
    const newLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);
    if (newLane !== this.currentLane) {
      this.currentLane = newLane;
      this.tweens.add({
        targets: this.player,
        x: this.lanePositions[this.currentLane],
        duration: 150,
        ease: 'Cubic.out'
      });
      
      // Slight tilt effect
      this.tweens.add({
        targets: this.player,
        angle: dir * 15,
        yoyo: true,
        duration: 150
      });
    }
  }

  activateBoost() {
    if (!this.isPlaying) return;
    this.boostTimer = 60; // 60 frames approx 1s speed boost
    this.tweens.add({
      targets: this.player,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }

  activateBrake() {
      // Stub for slide/brake
  }

  attachLabel(sprite, type) {
    if (type === 'tree') return;
    const names = {
      'donki': 'Don Quijote',
      'maglev_museum': 'Maglev Museum',
      'skytree': 'Skytree Tower',
      'tokyo_tower': 'Tokyo Tower'
    };
    
    const labelText = this.add.text(sprite.x, sprite.y + sprite.height / 2 + 5, names[type], {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 4, y: 2 }
    });
    labelText.setOrigin(0.5, 0);
    labelText.setDepth(3);
    sprite.label = labelText;
  }

  spawnEnvironment() {
    if (!this.isPlaying) return;
    
    const now = this.time.now;
    let spawnLeftBuilding = false;
    let spawnRightBuilding = false;
    let typeL = 'tree';
    let typeR = 'tree';
    
    // Cooldown logic to keep landmarks rare and completely unique (not near each other)
    if (now - (this.lastBuildingSpawn || 0) > 8000) {
      if (Math.random() > 0.5) {
         const buildings = ['donki', 'maglev_museum', 'skytree', 'tokyo_tower'];
         if (Math.random() > 0.5) {
           typeL = Phaser.Utils.Array.GetRandom(buildings);
           spawnLeftBuilding = true;
         } else {
           typeR = Phaser.Utils.Array.GetRandom(buildings);
           spawnRightBuilding = true;
         }
         this.lastBuildingSpawn = now;
      }
    }

    // Grass boundaries to strictly prevent clipping into the track
    const leftBound = this.lanePositions[0] - this.laneWidth / 2 - 20;
    const rightBound = this.lanePositions[2] + this.laneWidth / 2 + 20;

    // Constrain buildings natively within the pure grass fields
    if (Math.random() > 0.3 || spawnLeftBuilding) {
       let safeLeft;
       if (typeL !== 'tree') {
         safeLeft = Math.max(60, leftBound - 60); // Centered safely out of track reach
       } else {
         safeLeft = Phaser.Math.Between(10, leftBound);
       }
       const objL = this.trees.create(safeLeft, -250, typeL);
       if (typeL === 'tree') objL.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
       objL.setDepth(2);
       this.attachLabel(objL, typeL);
    }
    
    if (Math.random() > 0.3 || spawnRightBuilding) {
       let safeRight;
       if (typeR !== 'tree') {
         safeRight = Math.min(this.width - 60, rightBound + 60); // Centered safely out of track reach
       } else {
         safeRight = Phaser.Math.Between(rightBound, this.width - 10);
       }
       const objR = this.trees.create(safeRight, -250, typeR);
       if (typeR === 'tree') objR.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
       objR.setDepth(2);
       this.attachLabel(objR, typeR);
    }
  }

  spawnStation() {
    if (!this.isPlaying) return;
    
    const names = ["Tokyo Sta", "Osaka Sta", "Sapporo Sta", "Tengachaya Sta", "Yumeshima Sta"];
    const stationName = Phaser.Utils.Array.GetRandom(names);
    
    const isLeft = Math.random() > 0.5;
    let stationSprite;
    
    if (isLeft) {
      const xPos = this.lanePositions[0] - this.laneWidth / 2 - 40;
      stationSprite = this.stations.create(xPos, -400, 'station_left');
    } else {
      const xPos = this.lanePositions[2] + this.laneWidth / 2 + 40;
      stationSprite = this.stations.create(xPos, -400, 'station_right');
    }
    stationSprite.setDepth(1);
    
    // Add text label directly on top of the blue roof
    const textLabel = this.add.text(stationSprite.x, stationSprite.y, stationName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { blur: 4, color: '#004466', fill: true }
    });
    textLabel.setOrigin(0.5);
    textLabel.setAngle(isLeft ? -90 : 90); // Rotate to run parallel with track direction
    textLabel.setDepth(2);
    
    stationSprite.label = textLabel;
  }

  spawnObstacle() {
    if (!this.isPlaying) return;
    
    // Pick 1-2 random lanes
    const availableLanes = [0, 1, 2];
    Phaser.Utils.Array.Shuffle(availableLanes);
    const numObstacles = Phaser.Math.Between(1, 2);
    
    for (let i = 0; i < numObstacles; i++) {
        const laneIdx = availableLanes[i];
        const xPos = this.lanePositions[laneIdx];
        
        const randomModel = Phaser.Utils.Array.GetRandom(this.trainModels);
        const obstacle = this.obstacles.create(xPos, -250, randomModel);
        obstacle.setOrigin(0.5, 0.5);
        
        // Rotate 180 degrees so it looks like it's coming towards the player
        obstacle.setAngle(180);
        
        // Make the hit box only cover the front car of the incoming train
        obstacle.body.setSize(30, 60);
        // Because of rotation, the front is at the bottom of the unrotated sprite (or offset logic)
        // Actually, just leaving it center or full is easier but unfair. 
        // 180 rotation flips the offset.
        obstacle.body.setOffset(5, 120); 
    }
  }

  increaseDifficulty() {
    if (!this.isPlaying) return;
    this.speedMultiplier += 0.1;
    
    // Spawn faster
    if (this.obstacleTimer.delay > 500) {
      this.obstacleTimer.delay -= 50;
    }
  }

  hitObstacle() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    // Stop physics
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.cameras.main.shake(300, 0.02);

    if (this.cake) {
      // MASSIVE Screen-Covering Cake Explosion! 🎂💥
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00b4d8, 0xff4d6d, 0xffffff];
      
      // Explode from the crash site outwards
      for(let i = 0; i < 150; i++) {
        const confetti = this.add.rectangle(this.cake.x, this.cake.y, 12, 12, Phaser.Utils.Array.GetRandom(colors));
        this.physics.add.existing(confetti);
        confetti.body.setVelocity(Phaser.Math.Between(-1200, 1200), Phaser.Math.Between(-1200, 1200));
        confetti.body.setGravityY(800); // Pull them down like actual confetti bursting
        this.tweens.add({ targets: confetti, alpha: 0, duration: 2500, angle: 720, onComplete: () => confetti.destroy() });
      }

      // Rain confetti from the top of the entire screen
      for(let i = 0; i < 150; i++) {
        const xPos = Phaser.Math.Between(0, this.width);
        const yPos = Phaser.Math.Between(-300, -50);
        const randColor = Phaser.Utils.Array.GetRandom(colors);
        const fallingConfetti = this.add.rectangle(xPos, yPos, 14, 10, randColor);
        
        this.physics.add.existing(fallingConfetti);
        fallingConfetti.body.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(200, 600));
        fallingConfetti.body.setGravityY(200);
        
        // Spin back and forth like fluttering paper
        this.tweens.add({
            targets: fallingConfetti,
            angle: Phaser.Math.Between(360, 1080),
            alpha: 0,
            duration: 3500,
            ease: 'Sine.easeInOut',
            onComplete: () => fallingConfetti.destroy()
        });
      }

      this.cake.destroy();
      this.cake = null;
    }

    // Dispatch game over to React after effects finish
    window.dispatchEvent(new CustomEvent('gameCrashed', {
      detail: { score: this.score }
    }));
  }

  update(time, delta) {
    if (!this.isPlaying) return;

    let currentMulti = this.speedMultiplier;
    
    if (this.boostTimer > 0) {
      this.boostTimer--;
      currentMulti += 1.5; // Boost increases speed
    }

    const currentSpeed = this.baseSpeed * currentMulti;
    
    // Move obstacles
    this.obstacles.getChildren().forEach(obs => {
      obs.y += currentSpeed * (delta / 1000) * 1.5; // obstacles move faster relative to you
      if (obs.y > this.height + 300) {
        obs.destroy();
      }
    });

    // Move stations
    this.stations.getChildren().forEach(station => {
      station.y += currentSpeed * (delta / 1000);
      if (station.label) station.label.y = station.y; // Sync label position
      if (station.y > this.height + 400) {
        if (station.label) station.label.destroy();
        station.destroy();
      }
    });

    // Move trees and landmarks
    this.trees.getChildren().forEach(tree => {
      tree.y += currentSpeed * (delta / 1000);
      if (tree.label) tree.label.y = tree.y + tree.height / 2 + 5;
      if (tree.y > this.height + 100) {
        if (tree.label) tree.label.destroy();
        tree.destroy();
      }
    });

    // Scroll tracks to simulate speed
    this.trackTiles.forEach(tile => {
      tile.tilePositionY -= currentSpeed * (delta / 1000);
    });

    // Update score
    this.score += currentSpeed * (delta / 10000); // Scale down for readability

    // Cake tracks player
    if (this.cake) {
      this.cake.x = this.player.x;
      this.cake.y = this.player.y - 120; // Sit on the middle/front separation 
      this.cake.angle = this.player.angle;
    }

    // Broadcast score to React occasionally
    if (Math.floor(time) % 5 === 0) {
      window.dispatchEvent(new CustomEvent('updateScore', {
        detail: { score: this.score, multiplier: currentMulti }
      }));
    }
  }
}
