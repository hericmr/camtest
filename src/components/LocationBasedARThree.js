import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';

const LocationBasedARThree = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [arObjects, setArObjects] = useState([]);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [nearestObject, setNearestObject] = useState(null);

  // Configurações de localização (usa configurações globais se disponíveis)
  const config = useMemo(() => {
    const globalConfig = window.LOCATION_AR_CONFIG || {};
    const defaultObjects = [
      {
        id: 'trozoba-model',
        name: 'Trozoba',
        model: '/models/model-trozoba.glb',
        position: {
          latitude: -23.978699193445298,
          longitude: -46.31663867703862,
          altitude: 0
        },
        scale: 5,
        rotation: { x: 0, y: 0, z: 0 }
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
        scale: 2,
        rotation: { x: 0, y: 0, z: 0 }
      }
    ];
    
    return {
      // Coordenadas de exemplo (próximo ao modelo Trozoba)
      defaultLocation: {
        latitude: -23.978699193445298,
        longitude: -46.31663867703862
      },
      // Objetos AR para posicionar
      objects: globalConfig.objects || defaultObjects,
      // Mescla com configurações globais
      ...globalConfig
    };
  }, []);

  // Solicita permissão de localização
  const requestLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não é suportada por este navegador');
      }

      const gpsConfig = window.LOCATION_AR_CONFIG?.location?.gps || {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, gpsConfig);
      });

      const { latitude, longitude, accuracy } = position.coords;
      setUserLocation({ latitude, longitude });
      setGpsAccuracy(accuracy);
      
      console.log('Localização obtida:', { latitude, longitude, accuracy });
      return { latitude, longitude, accuracy };
    } catch (err) {
      console.warn('Erro ao obter localização:', err);
      // Usa localização padrão se não conseguir obter a do usuário
      const defaultLoc = config.defaultLocation || window.LOCATION_AR_CONFIG?.location?.default;
      setUserLocation(defaultLoc);
      return defaultLoc;
    }
  };

  // Inicializa a câmera
  const initializeCamera = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(permission.state);
          
          if (permission.state === 'denied') {
            throw new Error('Permissão da câmera negada pelo usuário');
          }
        } catch (permErr) {
          console.warn('Erro ao verificar permissões:', permErr);
        }
      }

      const cameraConfig = window.LOCATION_AR_CONFIG?.camera || {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
        aspectRatio: { ideal: 16/9 }
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraConfig,
        audio: false
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraPermission('granted');
      return true;
    } catch (err) {
      console.error('Erro ao inicializar câmera:', err);
      setCameraPermission('denied');
      return false;
    }
  };

  // Inicializa Three.js
  const initializeThreeJS = () => {
    try {
      if (!canvasRef.current) return false;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      const rendererConfig = window.LOCATION_AR_CONFIG?.rendering || {
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
      };
      
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        ...rendererConfig
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(window.devicePixelRatio || 1);

      // Posiciona a câmera
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      // Adiciona iluminação baseada nas configurações globais
      const lightingConfig = window.LOCATION_AR_CONFIG?.lighting || {
        ambient: { color: 0xffffff, intensity: 0.6 },
        directional: { color: 0xffffff, intensity: 0.8, position: { x: 0, y: 10, z: 5 } }
      };

      const ambientLight = new THREE.AmbientLight(
        lightingConfig.ambient.color, 
        lightingConfig.ambient.intensity
      );
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(
        lightingConfig.directional.color, 
        lightingConfig.directional.intensity
      );
      directionalLight.position.set(
        lightingConfig.directional.position.x,
        lightingConfig.directional.position.y,
        lightingConfig.directional.position.z
      );
      scene.add(directionalLight);

      // Atualiza referências
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;

      return true;
    } catch (err) {
      console.error('Erro ao inicializar Three.js:', err);
      setError(`Erro ao inicializar renderização 3D: ${err.message}`);
      return false;
    }
  };

  // Cria objetos AR baseados em localização
  const createARObjects = (location) => {
    if (!sceneRef.current) return [];

    const objects = [];
    const objectsToCreate = config.objects || [];
    
    objectsToCreate.forEach(obj => {
      // Usa utilitários globais se disponíveis
      let position3D;
      if (window.LOCATION_AR_UTILS?.gpsTo3D) {
        position3D = window.LOCATION_AR_UTILS.gpsTo3D(
          location.latitude, 
          location.longitude, 
          obj.position.latitude, 
          obj.position.longitude, 
          obj.position.altitude
        );
      } else {
        // Fallback para cálculo local
        const relativeLat = obj.position.latitude - location.latitude;
        const relativeLon = obj.position.longitude - location.longitude;
        const x = relativeLon * 111000;
        const z = -relativeLat * 111000;
        const y = obj.position.altitude;
        position3D = { x, y, z };
      }
      
      let threeObject;
      
      if (obj.type === 'text') {
        // Cria um plano com texto
        const geometry = new THREE.PlaneGeometry(2, 1);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        });
        threeObject = new THREE.Mesh(geometry, material);
        
        // Adiciona texto como label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(obj.text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        material.map = texture;
        material.needsUpdate = true;
      } else if (obj.type === 'model') {
        // Cria um cubo como placeholder para o modelo
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        threeObject = new THREE.Mesh(geometry, material);
      } else {
        // Cria um cubo como placeholder
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        threeObject = new THREE.Mesh(geometry, material);
      }
      
      // Aplica transformações
      threeObject.position.set(position3D.x, position3D.y, position3D.z);
      threeObject.scale.setScalar(obj.scale);
      threeObject.rotation.set(
        obj.rotation.x,
        obj.rotation.y,
        obj.rotation.z
      );
      
      // Adiciona à cena
      sceneRef.current.add(threeObject);
      objects.push({
        ...obj,
        threeObject,
        position3D
      });
    });

    setArObjects(objects);
    
    // Encontra o objeto mais próximo
    if (objects.length > 0 && window.LOCATION_AR_UTILS?.calculateDistance) {
      const nearest = objects.reduce((closest, current) => {
        const closestDist = window.LOCATION_AR_UTILS.calculateDistance(
          location.latitude, location.longitude,
          closest.position.latitude, closest.position.longitude
        );
        const currentDist = window.LOCATION_AR_UTILS.calculateDistance(
          location.latitude, location.longitude,
          current.position.latitude, current.position.longitude
        );
        return currentDist < closestDist ? current : closest;
      });
      setNearestObject(nearest);
    }
    
    return objects;
  };

  // Loop de renderização
  const renderLoop = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Atualiza posições dos objetos baseado na localização
    if (userLocation && arObjects.length > 0) {
      arObjects.forEach(obj => {
        if (obj.threeObject) {
          // Simula movimento sutil dos objetos
          obj.threeObject.rotation.y += 0.01;
        }
      });
    }

    // Renderiza a cena
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    requestAnimationFrame(renderLoop);
  };

  // Inicializa o AR baseado em localização
  const initializeLocationAR = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Obtém localização do usuário
      const location = await requestLocationPermission();
      
      // Inicializa Three.js
      const threeOk = initializeThreeJS();
      if (!threeOk) {
        throw new Error('Falha ao inicializar renderização 3D');
      }

      // Tenta inicializar a câmera (opcional)
      try {
        await initializeCamera();
      } catch (cameraErr) {
        console.warn('Câmera não disponível, continuando sem câmera:', cameraErr);
      }

      // Cria objetos AR
      createARObjects(location);
      
      // Inicia o loop de renderização
      renderLoop();
      
    } catch (err) {
      console.error('Erro ao inicializar AR:', err);
      setError(`Erro ao inicializar AR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        await initializeLocationAR();
      } catch (err) {
        console.error('Erro na inicialização:', err);
        setError(`Erro na inicialização: ${err.message}`);
      }
    };

    init();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initializeLocationAR]);

  // Handler para redimensionamento
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para adicionar novo objeto AR
  const addARObject = () => {
    if (!userLocation || !sceneRef.current) return;

    const newObject = {
      id: `object-${Date.now()}`,
      name: 'Novo Objeto',
      type: 'cube',
      position: {
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.001, // ±500m
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.001,
        altitude: 0
      },
      scale: 2,
      rotation: { x: 0, y: 0, z: 0 }
    };

    // Calcula posição 3D
    let position3D;
    if (window.LOCATION_AR_UTILS?.gpsTo3D) {
      position3D = window.LOCATION_AR_UTILS.gpsTo3D(
        userLocation.latitude,
        userLocation.longitude,
        newObject.position.latitude,
        newObject.position.longitude,
        newObject.position.altitude
      );
    } else {
      const relativeLat = newObject.position.latitude - userLocation.latitude;
      const relativeLon = newObject.position.longitude - userLocation.longitude;
      const x = relativeLon * 111000;
      const z = -relativeLat * 111000;
      const y = newObject.position.altitude;
      position3D = { x, y, z };
    }

    // Cria objeto 3D
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const threeObject = new THREE.Mesh(geometry, material);
    
    threeObject.position.set(position3D.x, position3D.y, position3D.z);
    threeObject.scale.setScalar(newObject.scale);
    
    sceneRef.current.add(threeObject);
    
    const updatedObject = {
      ...newObject,
      threeObject,
      position3D
    };

    setArObjects(prev => [...prev, updatedObject]);
  };

  // Função para recalibrar localização
  const recalibrateLocation = async () => {
    setIsLoading(true);
    await initializeLocationAR();
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Vídeo da câmera como fundo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      {/* Canvas do Three.js para renderização 3D */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none'
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
        <h3 style={{ margin: '0 0 15px 0' }}>📍 AR por Localização (Three.js)</h3>
        
        {userLocation && (
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <div>📍 Sua localização:</div>
            <div>Lat: {userLocation.latitude.toFixed(6)}</div>
            <div>Lon: {userLocation.longitude.toFixed(6)}</div>
            {gpsAccuracy && (
              <div>Precisão: {gpsAccuracy.toFixed(1)}m</div>
            )}
          </div>
        )}
        
        {nearestObject && window.LOCATION_AR_UTILS?.calculateDistance && (
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <div>🎯 Objeto mais próximo:</div>
            <div>{nearestObject.name}</div>
            <div>
              {window.LOCATION_AR_UTILS.formatDistance(
                window.LOCATION_AR_UTILS.calculateDistance(
                  userLocation.latitude, userLocation.longitude,
                  nearestObject.position.latitude, nearestObject.position.longitude
                )
              )}
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '15px', fontSize: '12px' }}>
          <div>📹 Câmera: {cameraPermission}</div>
          <div>🎯 Objetos: {arObjects.length}</div>
        </div>
        
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
        zIndex: 1000,
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
          <li>Permita acesso à câmera para fundo</li>
          <li>Mova o dispositivo para ver objetos AR</li>
          <li>Use "Adicionar Objeto" para criar novos pontos</li>
          <li>Use "Recalibrar GPS" se necessário</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationBasedARThree;
