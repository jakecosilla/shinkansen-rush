import React from 'react';
import { RotateCcw, Home } from 'lucide-react';

const GameOver = ({ score, onRestart, onMenu, config }) => {
  let isBirthday = false;
  if (config && config.birthday && config.birthday.length >= 5) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    if (config.birthday.substring(5) === `${mm}-${dd}`) {
      isBirthday = true;
    }
  }
  const playerName = config?.name ? config.name.toUpperCase() : 'PLAYER';

  if (isBirthday) {
    return (
      <div className="ui-overlay">
        <style>
          {`
            @keyframes bouncePulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
        <h1 style={{
          color: 'var(--primary-color)',
          textShadow: '0 0 20px rgba(0, 119, 182, 0.5)',
          marginTop: '4rem',
          padding: '0 1rem',
          fontSize: 'clamp(1.8rem, 6vw, 3rem)',
          lineHeight: 1.2,
          animation: 'bouncePulse 0.8s infinite ease-in-out',
          WebkitTextFillColor: 'var(--primary-color)'
        }}>
          HAPPY BIRTHDAY,<br />{playerName}!🎉
        </h1>
        <div className="subtitle" style={{ color: 'var(--secondary-color)' }}>お誕生日おめでとう！</div>

        <div style={{
          fontSize: 'clamp(2.5rem, 10vw, 4rem)',
          margin: '1rem 0',
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif'
        }}>
          <span>🎊</span>
          <span>🚄🎂</span>
          <span>🎊</span>
        </div>

        <div style={{ margin: '2rem 0', textAlign: 'center', background: 'rgba(255,255,255,0.9)', padding: '1rem 3rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.2rem', color: '#555', textTransform: 'uppercase', fontWeight: 'bold' }}>Birthday Run Distance🎂</div>
          <div className="score-display" style={{ color: 'var(--primary-color)', marginBottom: 0 }}>{Math.floor(score)}m</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem', width: '100%' }}>
          <button className="btn" onClick={onRestart}>
            <RotateCcw style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            RACE AGAIN
          </button>
          <button className="btn btn-secondary" onClick={onMenu}>
            <Home style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-overlay">
      <h1 style={{ color: '#ff003c', textShadow: '0 0 20px rgba(255, 0, 60, 0.5)', marginTop: '4rem' }}>
        CRASHED!
      </h1>
      <div className="subtitle" style={{ color: '#ff4d6d' }}>ゲームオーバー</div>

      <div style={{ margin: '2rem 0', textAlign: 'center', background: 'rgba(255,255,255,0.9)', padding: '1rem 3rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '1.2rem', color: '#555', textTransform: 'uppercase', fontWeight: 'bold' }}>Distance Traveled</div>
        <div className="score-display" style={{ marginBottom: 0 }}>{Math.floor(score)}m</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem', width: '100%' }}>
        <button className="btn" onClick={onRestart}>
          <RotateCcw style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          RACE AGAIN
        </button>
        <button className="btn btn-secondary" onClick={onMenu}>
          <Home style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          MAIN MENU
        </button>
      </div>
    </div>
  );
};

export default GameOver;
