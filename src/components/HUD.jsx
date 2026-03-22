import React from 'react';
import { Route, Zap } from 'lucide-react';

const HUD = ({ score, multiplier }) => {
  return (
    <div className="hud-container">
      <div className="hud-box">
        <Route color="var(--primary-color)" />
        <div>
          <div className="hud-label">Distance</div>
          <div className="hud-value">{Math.floor(score)}m</div>
        </div>
      </div>

      <div className="hud-box" style={{ borderColor: 'var(--secondary-color)' }}>
        <Zap color="var(--secondary-color)" />
        <div>
          <div className="hud-label">Speed</div>
          <div className="hud-value" style={{ color: 'var(--secondary-color)' }}>x{multiplier.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
