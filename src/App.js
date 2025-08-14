import React, { useState } from 'react';
import './App.css';
import AdvancedARScene from './components/AdvancedARScene';
import LocationBasedAR from './components/LocationBasedAR';
import LocationBasedARThree from './components/LocationBasedARThree';

function App() {
  const [selectedAR, setSelectedAR] = useState('location-three'); // Padrão para AR por localização

  const renderARComponent = () => {
    switch (selectedAR) {
      case 'advanced':
        return <AdvancedARScene />;
      case 'location-aframe':
        return <LocationBasedAR />;
      case 'location-three':
        return <LocationBasedARThree />;
      default:
        return <LocationBasedARThree />;
    }
  };

  return (
    <div className="App">
      {/* Seletor de tipo de AR */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        minWidth: '200px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>🎭 Seletor de AR</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
            <input
              type="radio"
              name="arType"
              value="location-three"
              checked={selectedAR === 'location-three'}
              onChange={(e) => setSelectedAR(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            📍 AR por Localização (Three.js)
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
            <input
              type="radio"
              name="arType"
              value="location-aframe"
              checked={selectedAR === 'location-aframe'}
              onChange={(e) => setSelectedAR(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            📍 AR por Localização (A-Frame)
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
            <input
              type="radio"
              name="arType"
              value="advanced"
              checked={selectedAR === 'advanced'}
              onChange={(e) => setSelectedAR(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            🎯 AR Avançado (Sensores)
          </label>
        </div>
        
        <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'center' }}>
          {selectedAR === 'location-three' && 'AR baseado em GPS com Three.js'}
          {selectedAR === 'location-aframe' && 'AR baseado em GPS com A-Frame'}
          {selectedAR === 'advanced' && 'AR com sensores do dispositivo'}
        </div>
      </div>

      {/* Componente AR selecionado */}
      {renderARComponent()}
    </div>
  );
}

export default App;
