import React, { useEffect, useRef, useState } from 'react';

const LocationBasedAR = () => {
  const aframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [arObjects, setArObjects] = useState([]);

  // Configurações de localização
  const config = {
    // Coordenadas de exemplo (próximo ao modelo Trozoba)
    defaultLocation: {
      latitude: -23.978699193445298,
      longitude: -46.31663867703862
    },
          // Objetos AR para posicionar
      objects: [
        {
          id: 'trozoba-model',
          name: 'Trozoba',
          model: '/models/model-trozoba.glb',
          position: {
            latitude: -23.978699193445298,
            longitude: -46.31663867703862,
            altitude: 0
          },
          scale: '5 5 5',
          rotation: '0 0 0'
        },
        {
          id: 'info-panel',
          name: 'Painel de Informações',
          type: 'text',
          text: 'Bem-vindo ao AR Trozoba!',
          position: {
            latitude: -23.978699193445298,
            longitude: -46.31663867703862,
            altitude: 0
          },
          scale: '2 2 2',
          rotation: '0 0 0'
        }
      ]
  };

  // Solicita permissão de localização
  const requestLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não é suportada por este navegador');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      
      console.log('Localização obtida:', { latitude, longitude });
      return { latitude, longitude };
    } catch (err) {
      console.warn('Erro ao obter localização:', err);
      // Usa localização padrão se não conseguir obter a do usuário
      setUserLocation(config.defaultLocation);
      return config.defaultLocation;
    }
  };

  // Inicializa o AR baseado em localização
  const initializeLocationAR = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Obtém localização do usuário
      const location = await requestLocationPermission();
      
      // Atualiza as posições dos objetos baseado na localização do usuário
      const updatedObjects = config.objects.map(obj => {
        // Calcula posição relativa ao usuário
        const relativeLat = obj.position.latitude - location.latitude;
        const relativeLon = obj.position.longitude - location.longitude;
        
        // Converte para coordenadas 3D (aproximação simples)
        const x = relativeLon * 111000; // 1 grau ≈ 111km
        const z = -relativeLat * 111000; // Negativo para corresponder ao sistema de coordenadas 3D
        
        return {
          ...obj,
          position3D: { x, y: obj.position.altitude, z }
        };
      });

      setArObjects(updatedObjects);

      // Cria a cena A-Frame
      createAFrameScene(updatedObjects);
      
    } catch (err) {
      console.error('Erro ao inicializar AR:', err);
      setError(`Erro ao inicializar AR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cria a cena A-Frame
  const createAFrameScene = (objects) => {
    if (!aframeRef.current) return;

    // Cria o HTML da cena A-Frame
    const aframeHTML = `
      <a-scene
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        renderer="logarithmicDepthBuffer: true;"
        style="width: 100%; height: 100%;"
      >
        <!-- Câmera AR -->
        <a-camera
          gps-camera
          rotation-reader
          look-controls-enabled="false"
          arjs-look-controls="smoothingFactor: 0.1"
        ></a-camera>

        <!-- Objetos AR baseados em localização -->
        ${objects.map(obj => {
          if (obj.type === 'text') {
            return `
              <a-text
                id="${obj.id}"
                value="${obj.text}"
                position="${obj.position3D.x} ${obj.position3D.y} ${obj.position3D.z}"
                scale="${obj.scale}"
                rotation="${obj.rotation}"
                color="#ffffff"
                align="center"
                font="kelsonsans"
                shader="msdf"
                gps-entity-place="${obj.position.latitude}; ${obj.position.longitude}"
              ></a-text>
            `;
          } else {
            return `
              <a-entity
                id="${obj.id}"
                position="${obj.position3D.x} ${obj.position3D.y} ${obj.position3D.z}"
                scale="${obj.scale}"
                rotation="${obj.rotation}"
                gps-entity-place="${obj.position.latitude}; ${obj.position.longitude}"
                gltf-model="${obj.model}"
                shadow
                animation-mixer
              ></a-entity>
            `;
          }
        }).join('')}

        <!-- Luz ambiente -->
        <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
        <a-light type="directional" color="#ffffff" intensity="0.8" position="0 10 5"></a-light>

        <!-- Céu -->
        <a-sky color="#87CEEB"></a-sky>
      </a-scene>
    `;

    // Insere o HTML no container
    aframeRef.current.innerHTML = aframeHTML;
  };

  // Carrega os scripts necessários
  const loadARScripts = () => {
    return new Promise((resolve) => {
      // Verifica se os scripts já estão carregados
      if (window.AFRAME && window.AFRAME.components['gps-camera']) {
        resolve();
        return;
      }

      // Carrega A-Frame
      const aframeScript = document.createElement('script');
      aframeScript.src = 'https://aframe.io/releases/1.3.0/aframe.min.js';
      aframeScript.onload = () => {
        console.log('A-Frame carregado');
        
        // Carrega AR.js location-based
        const arLocationScript = document.createElement('script');
        arLocationScript.src = 'https://raw.githack.com/AR-js-org/AR.js/3.4.5/three.js/build/ar-threex-location-only.js';
        arLocationScript.onload = () => {
          console.log('AR.js location-only carregado');
          
          // Carrega componentes A-Frame para AR
          const arAFrameScript = document.createElement('script');
          arAFrameScript.src = 'https://raw.githack.com/AR-js-org/AR.js/3.4.5/aframe/build/aframe-ar.js';
          arAFrameScript.onload = () => {
            console.log('AR.js A-Frame carregado');
            
            // Carrega componentes GPS para localização
            const gpsScript = document.createElement('script');
            gpsScript.src = 'https://raw.githack.com/AR-js-org/AR.js/3.4.5/aframe/build/aframe-gps-entity-place-component.min.js';
            gpsScript.onload = () => {
              console.log('GPS Entity Place Component carregado');
              resolve();
            };
            gpsScript.onerror = () => {
              console.warn('GPS Entity Place Component não pôde ser carregado, continuando...');
              resolve();
            };
            document.head.appendChild(gpsScript);
          };
          arAFrameScript.onerror = () => {
            console.warn('AR.js A-Frame não pôde ser carregado, continuando...');
            resolve();
          };
          document.head.appendChild(arAFrameScript);
        };
        arLocationScript.onerror = () => {
          console.warn('AR.js location-only não pôde ser carregado, continuando...');
          resolve();
        };
        document.head.appendChild(arLocationScript);
      };
      aframeScript.onerror = () => {
        console.error('Erro ao carregar A-Frame');
        setError('Erro ao carregar A-Frame');
        resolve();
      };
      document.head.appendChild(aframeScript);
    });
  };

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        // Carrega os scripts necessários
        await loadARScripts();
        
        // Aguarda um pouco para garantir que tudo foi carregado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Inicializa o AR
        await initializeLocationAR();
      } catch (err) {
        console.error('Erro na inicialização:', err);
        setError(`Erro na inicialização: ${err.message}`);
      }
    };

    init();
  }, []);

  // Função para adicionar novo objeto AR
  const addARObject = () => {
    if (!userLocation) return;

    const newObject = {
      id: `object-${Date.now()}`,
      name: 'Novo Objeto',
      type: 'text',
      text: 'Novo objeto AR!',
      position: {
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.001, // ±500m
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.001,
        altitude: 0
      },
      scale: '2 2 2',
      rotation: '0 0 0'
    };

    setArObjects(prev => [...prev, newObject]);
    
    // Recria a cena com o novo objeto
    setTimeout(() => {
      createAFrameScene([...arObjects, newObject]);
    }, 100);
  };

  // Função para recalibrar localização
  const recalibrateLocation = async () => {
    setIsLoading(true);
    await initializeLocationAR();
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Container para A-Frame */}
      <div 
        ref={aframeRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          color: 'white'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>📍</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Inicializando AR por Localização...</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Obtendo sua posição GPS</div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(220, 53, 69, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>⚠️ Erro</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{error}</p>
          
          <button 
            onClick={() => setError('')}
            style={{
              background: 'white',
              color: '#dc3545',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '15px'
            }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Controles */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📍 AR por Localização</h3>
        
        {userLocation && (
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <div>📍 Sua localização:</div>
            <div>Lat: {userLocation.latitude.toFixed(6)}</div>
            <div>Lon: {userLocation.longitude.toFixed(6)}</div>
          </div>
        )}
        
        <button 
          onClick={addARObject}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            fontSize: '14px',
            marginBottom: '10px'
          }}
        >
          ➕ Adicionar Objeto
        </button>
        
        <button 
          onClick={recalibrateLocation}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Recalibrar GPS
        </button>
        
        <p style={{ margin: '15px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
          📱 Use em dispositivo móvel com GPS ativo
        </p>
      </div>

      {/* Instruções */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '1000',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>🚀 Como usar:</h4>
        <ul style={{ 
          margin: '0', 
          padding: '0 0 0 20px', 
          textAlign: 'left',
          fontSize: '14px'
        }}>
          <li>Permita acesso à localização GPS</li>
          <li>Mova o dispositivo para ver objetos AR</li>
          <li>Use "Adicionar Objeto" para criar novos pontos</li>
          <li>Use "Recalibrar GPS" se necessário</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationBasedAR;
