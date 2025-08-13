// Configurações de AR para o aplicativo
window.AR_CONFIG = {
  // Configurações da câmera
  camera: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment', // Câmera traseira por padrão
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 30 }
  },
  
  // Configurações do modelo 3D
  model: {
    scale: 2.5,
    position: { x: 0, y: -1, z: -3 },
    rotation: { x: 0, y: 0, z: 0 },
    autoLoad: true,
    file: '/trozoba.glb'
  },
  
  // Configurações dos sensores
  sensors: {
    sensitivity: 0.5,
    enableGyroscope: true,
    enableAccelerometer: true,
    enableMagnetometer: true,
    updateRate: 60 // Hz
  },
  
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
    directional: { color: 0xffffff, intensity: 0.8, position: { x: 0, y: 10, z: 5 } }
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
    logLevel: 'warn' // 'debug', 'info', 'warn', 'error'
  }
};

// Função para verificar suporte a recursos
window.AR_UTILS = {
  // Verifica se o navegador suporta WebGL
  supportsWebGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  },
  
  // Verifica se o dispositivo suporta sensores
  supportsSensors: () => {
    return !!(window.DeviceOrientationEvent || window.DeviceMotionEvent);
  },
  
  // Verifica se o dispositivo suporta câmera
  supportsCamera: () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },
  
  // Verifica se o dispositivo suporta WebXR
  supportsWebXR: () => {
    return !!(navigator.xr && navigator.xr.isSessionSupported);
  },
  
  // Verifica se é um dispositivo móvel
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Verifica se é um dispositivo iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  // Verifica se é um dispositivo Android
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },
  
  // Solicita permissões necessárias
  requestPermissions: async () => {
    const permissions = {};
    
    try {
      // Permissão da câmera
      if (navigator.permissions && navigator.permissions.query) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        permissions.camera = cameraPermission.state;
      }
      
      // Permissão dos sensores (iOS)
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const sensorPermission = await DeviceOrientationEvent.requestPermission();
          permissions.sensors = sensorPermission;
        } catch (e) {
          permissions.sensors = 'denied';
        }
      }
      
    } catch (e) {
      console.warn('Erro ao verificar permissões:', e);
    }
    
    return permissions;
  },
  
  // Função para calibrar sensores
  calibrateSensors: () => {
    return new Promise((resolve) => {
      let samples = [];
      let sampleCount = 0;
      const maxSamples = 100;
      
      const handleOrientation = (event) => {
        samples.push({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        });
        
        sampleCount++;
        
        if (sampleCount >= maxSamples) {
          window.removeEventListener('deviceorientation', handleOrientation);
          
          // Calcula valores médios para calibração
          const avg = samples.reduce((acc, sample) => {
            acc.alpha += sample.alpha;
            acc.beta += sample.beta;
            acc.gamma += sample.gamma;
            return acc;
          }, { alpha: 0, beta: 0, gamma: 0 });
          
          avg.alpha /= maxSamples;
          avg.beta /= maxSamples;
          avg.gamma /= maxSamples;
          
          resolve(avg);
        }
      };
      
      window.addEventListener('deviceorientation', handleOrientation);
      
      // Timeout de segurança
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handleOrientation);
        resolve({ alpha: 0, beta: 0, gamma: 0 });
      }, 10000);
    });
  }
};

// Log de inicialização
console.log('🎭 AR Config carregado:', window.AR_CONFIG);
console.log('📱 Suporte a sensores:', window.AR_UTILS.supportsSensors());
console.log('📹 Suporte a câmera:', window.AR_UTILS.supportsCamera());
console.log('🌐 Suporte a WebXR:', window.AR_UTILS.supportsWebXR());
console.log('📱 É dispositivo móvel:', window.AR_UTILS.isMobile());
