import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { TrainSVGs } from '../game/TrainAssets';

const allTrains = ['hayabusa', 'doctoryellow', 'maglev', 'n700', 'komachi', 'thomas'];
const getTrainURI = (id) => `data:image/svg+xml;utf8,${encodeURIComponent(TrainSVGs[id])}`;

const MainMenu = ({ onStart }) => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [selectedTrain, setSelectedTrain] = useState('maglev');

  const handleStart = () => {
    onStart({ name, birthday, selectedTrain });
  };

  return (
    <div className="ui-overlay" style={{ background: 'var(--dark-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', overflowY: 'auto', padding: '2rem 0' }}>
      <h1>Shinkansen Rush</h1>
      <div className="subtitle">新幹線ラッシュ</div>

      {/* Visual Train Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', maxWidth: '800px' }}>
        {allTrains.map(id => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedTrain(id)}>
            <img
              src={getTrainURI(id)}
              alt={id}
              style={{
                height: '140px',
                filter: selectedTrain === id ? `drop-shadow(0 15px 15px var(--primary-color))` : 'drop-shadow(0 5px 5px rgba(0,0,0,0.2))',
                transform: selectedTrain === id ? 'scale(1.2) translateY(-10px)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                opacity: selectedTrain === id ? 1 : 0.6
              }}
            />
            {selectedTrain === id && (
              <div style={{ marginTop: '1rem', color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                {id}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.9)', padding: '1.5rem', borderRadius: '15px', width: '90%', maxWidth: '360px', marginBottom: '1.5rem', border: '3px solid var(--primary-color)', boxShadow: '0 5px 15px rgba(0, 119, 182, 0.2)', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#444', marginBottom: '0.4rem', fontWeight: 'bold' }}>PLAYER NAME</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter Name" style={{ width: '100%', maxWidth: '100%', height: '3.2rem', padding: '0 0.8rem', borderRadius: '8px', border: '2px solid var(--primary-color)', background: '#fff', color: '#222', fontSize: '1.2rem', outline: 'none', boxSizing: 'border-box', margin: 0, appearance: 'none', WebkitAppearance: 'none', fontFamily: 'inherit' }} />
        </div>

        <div style={{ marginBottom: '0' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#444', marginBottom: '0.4rem', fontWeight: 'bold' }}>BIRTHDAY</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={{ width: '100%', maxWidth: '100%', height: '3.2rem', padding: '0 0.8rem', borderRadius: '8px', border: '2px solid var(--primary-color)', background: '#fff', color: '#222', fontSize: '1.2rem', colorScheme: 'light', outline: 'none', boxSizing: 'border-box', margin: 0, appearance: 'none', WebkitAppearance: 'none', fontFamily: 'inherit' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn" onClick={handleStart}>
          <Play style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          START RACE
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
