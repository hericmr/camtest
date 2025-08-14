// Configurações para AR baseado em localização
window.LOCATION_AR_CONFIG = {
  // Configurações de localização
  location: {
    // Coordenadas padrão (próximo ao modelo Trozoba - você pode alterar para sua localização)
    default: {
      latitude: -23.978699193445298,
      longitude: -46.31663867703862,
      altitude: 0
    },
    // Configurações de GPS
    gps: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    },
    // Precisão mínima em metros
    minAccuracy: 10,
    // Distância máxima para mostrar objetos em tamanho normal
    maxDistanceForNormalScale: 1000, // 1km
    // Distância máxima para mostrar objetos (depois disso, escala diminui)
    maxDistanceForVisibility: 10000, // 10km
    // Escala mínima para objetos muito distantes
    minScale: 0.1
  },
  
  // Objetos AR para posicionar no mundo
  objects: [
    {
      id: 'trozoba-model',
      name: 'Trozoba',
      type: 'model',
      model: '/models/model-trozoba.glb',
      position: {
        latitude: -23.978699193445298,
        longitude: -46.31663867703862,
        altitude: 0
      },
      scale: 5,
      rotation: { x: 0, y: 0, z: 0 },
      description: 'Modelo 3D do Trozoba'
    },
    {
      id: 'info-panel',
      name: 'Painel de Informações',
      type: 'text',
      text: 'Bem-vindo ao AR Trozoba!',
      position: {
        latitude: -23.5506,
        longitude: -46.6334,
        altitude: 0
      },
      scale: 2,
      rotation: { x: 0, y: 0, z: 0 },
      description: 'Painel informativo'
    },
    {
      id: 'landmark-1',
      name: 'Ponto de Referência 1',
      type: 'cube',
      position: {
        latitude: -23.5504,
        longitude: -46.6332,
        altitude: 0
      },
      scale: 3,
      rotation: { x: 0, y: 0, z: 0 },
      description: 'Ponto de referência para navegação'
    }
  ],
  
  // Configurações de renderização
  rendering: {
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    pixelRatio: 'auto',
    shadowMap: false,
    fog: false
  },
  
  // Configurações de iluminação
  lighting: {
    ambient: { color: 0xffffff, intensity: 0.6 },
    directional: { color: 0xffffff, intensity: 0.8, position: { x: 0, 10, 5 } }
  },
  
  // Configurações de câmera
  camera: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment',
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 30 }
  },
  
  // Configurações de performance
  performance: {
    maxFPS: 60,
    enableStats: false,
    enableDebug: false,
    lowPowerMode: false
  },
  
  // Configurações de debug
  debug: {
    showStats: false,
    showAxes: false,
    showGrid: false,
    showBoundingBox: false,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
  }
};

// Utilitários para AR baseado em localização
window.LOCATION_AR_UTILS = {
  // Calcula distância entre duas coordenadas GPS (fórmula de Haversine)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  // Converte coordenadas GPS para coordenadas 3D relativas
  gpsTo3D: (userLat, userLon, objectLat, objectLon, altitude = 0) => {
    // Converte para coordenadas 3D (aproximação simples)
    const relativeLat = objectLat - userLat;
    const relativeLon = objectLon - userLon;
    
    // 1 grau ≈ 111km
    const x = relativeLon * 111000;
    const z = -relativeLat * 111000; // Negativo para corresponder ao sistema de coordenadas 3D
    const y = altitude;
    
    return { x, y, z };
  },
  
  // Converte coordenadas 3D para coordenadas GPS
  threeDToGPS: (userLat, userLon, x, z, altitude = 0) => {
    const relativeLon = x / 111000;
    const relativeLat = -z / 111000; // Negativo para corresponder ao sistema de coordenadas 3D
    
    return {
      latitude: userLat + relativeLat,
      longitude: userLon + relativeLon,
      altitude: altitude
    };
  },
  
  // Verifica se um objeto está dentro do campo de visão
  isInFieldOfView: (cameraPosition, objectPosition, maxDistance = 100) => {
    const distance = Math.sqrt(
      Math.pow(cameraPosition.x - objectPosition.x, 2) +
      Math.pow(cameraPosition.y - objectPosition.y, 2) +
      Math.pow(cameraPosition.z - objectPosition.z, 2)
    );
    return distance <= maxDistance;
  },
  
  // Filtra objetos por distância
  filterObjectsByDistance: (userLat, userLon, objects, maxDistance = 1000) => {
    return objects.filter(obj => {
      const distance = window.LOCATION_AR_UTILS.calculateDistance(
        userLat, userLon,
        obj.position.latitude, obj.position.longitude
      );
      return distance <= maxDistance;
    });
  },
  
  // Obtém direção para um objeto (bússola)
  getDirectionToObject: (userLat, userLon, objectLat, objectLon) => {
    const dLon = (objectLon - userLon) * Math.PI / 180;
    const lat1 = userLat * Math.PI / 180;
    const lat2 = objectLat * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normaliza para 0-360
    
    return bearing;
  },
  
  // Formata coordenadas para exibição
  formatCoordinates: (lat, lon, precision = 6) => {
    const latStr = lat >= 0 ? `${lat.toFixed(precision)}°N` : `${Math.abs(lat).toFixed(precision)}°S`;
    const lonStr = lon >= 0 ? `${lon.toFixed(precision)}°E` : `${Math.abs(lon).toFixed(precision)}°W`;
    return `${latStr}, ${lonStr}`;
  },
  
  // Formata distância para exibição
  formatDistance: (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  },
  
  // Calcula escala baseada na distância
  calculateScaleByDistance: (distance, baseScale = 1, maxDistance = 1000, minScale = 0.1) => {
    if (distance <= maxDistance) {
      return baseScale; // Escala normal para distâncias próximas
    } else {
      // Escala diminui linearmente com a distância
      const scaleFactor = Math.max(minScale, maxDistance / distance);
      return baseScale * scaleFactor;
    }
  },
  
  // Verifica se um objeto deve ser visível baseado na distância
  shouldShowObject: (distance, maxDistance = 10000) => {
    return distance <= maxDistance;
  },
  
  // Obtém direção cardinal (N, S, L, O) para um objeto
  getCardinalDirection: (bearing) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  }
};

// Log de inicialização
console.log('📍 Location AR Config carregado:', window.LOCATION_AR_CONFIG);
console.log('🔧 Location AR Utils disponível:', !!window.LOCATION_AR_UTILS);
