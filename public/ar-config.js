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
    scale: 5.0, // Aumentado de 2.5 para 5.0
    position: { x: 0, y: -1, z: -3 },
    rotation: { x: 0, y: 0, z: 0 },
    autoLoad: true,
    file: null, // Será definido dinamicamente
    color: 0x000000 // Cor preta (hex)
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

// Função para determinar o caminho correto do modelo baseado no ambiente
window.AR_UTILS.getModelPath = (filename) => {
  console.log('🔧 getModelPath chamado com:', filename);
  console.log('📍 Hostname:', window.location.hostname);
  console.log('📍 Pathname:', window.location.pathname);
  
  // Se estamos em GitHub Pages, adiciona o nome do repositório ao caminho
  if (window.location.hostname === 'hericmr.github.io') {
    const pathParts = window.location.pathname.split('/');
    const repoName = pathParts[1]; // O primeiro segmento após o domínio
    if (repoName && repoName !== '') {
      const result = `/${repoName}/${filename}`;
      console.log('🌐 GitHub Pages - caminho calculado:', result);
      return result;
    }
  }
  
  // Para desenvolvimento local ou outros ambientes, usa caminho relativo
  // Tenta diferentes estratégias de caminho
  const basePath = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : window.location.pathname + '/';
  
  const result = basePath + filename;
  console.log('🏠 Desenvolvimento local - caminho calculado:', result);
  return result;
};

// Função para obter o caminho base correto
window.AR_UTILS.getBasePath = () => {
  // Se estamos em GitHub Pages
  if (window.location.hostname === 'hericmr.github.io') {
    const pathParts = window.location.pathname.split('/');
    const repoName = pathParts[1];
    if (repoName && repoName !== '') {
      return `/${repoName}/`;
    }
  }
  
  // Para desenvolvimento local
  return window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : window.location.pathname + '/';
};

// Função para testar a acessibilidade do arquivo do modelo
window.AR_UTILS.testModelAccessibility = async (filename) => {
  const basePath = window.AR_UTILS.getBasePath();
  const paths = [
    filename, // Caminho original
    `./${filename}`, // Caminho relativo
    `/${filename}`, // Caminho absoluto
    `${basePath}${filename}`, // Caminho base calculado
    window.AR_UTILS.getModelPath(filename), // Caminho calculado
    `${window.location.origin}${basePath}${filename}`, // URL completa
    `${window.location.origin}/${filename}` // URL direta
  ];
  
  console.log('🧪 Testando acessibilidade do modelo...');
  console.log('📍 Caminhos que serão testados:', paths);
  
  for (const path of paths) {
    try {
      console.log(`🔍 Testando: ${path}`);
      const response = await fetch(path, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Caminho funcionando: ${path}`);
        console.log(`📊 Tamanho do arquivo: ${response.headers.get('content-length')} bytes`);
        console.log(`🔗 URL final: ${response.url}`);
        return path;
      } else {
        console.log(`❌ Caminho falhou: ${path} (${response.status} ${response.statusText})`);
      }
    } catch (error) {
      console.log(`❌ Caminho falhou: ${path} - ${error.message}`);
    }
  }
  
  console.log('❌ Nenhum caminho funcionou');
  return null;
};

// Função para verificar a estrutura de arquivos disponíveis
window.AR_UTILS.debugFileStructure = async () => {
  const commonFiles = [
    'model-trozoba.glb',
    'ar-config.js',
    'index.html',
    'manifest.json'
  ];
  
  console.log('📁 Verificando estrutura de arquivos...');
  
  for (const file of commonFiles) {
    try {
      const response = await fetch(file, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ ${file} - Acessível (${response.status})`);
      } else {
        console.log(`❌ ${file} - Não acessível (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Erro: ${error.message}`);
    }
  }
};

// Atualiza o caminho do modelo dinamicamente
if (window.AR_CONFIG && window.AR_CONFIG.model) {
  // Define o caminho inicial
  window.AR_CONFIG.model.file = window.AR_UTILS.getModelPath('models/model-trozoba.glb');
  
  console.log('🚀 Caminho inicial do modelo:', window.AR_CONFIG.model.file);
  
  // Testa a acessibilidade do modelo após um pequeno delay
  setTimeout(async () => {
    console.log('🧪 Iniciando testes de acessibilidade...');
    
    const workingPath = await window.AR_UTILS.testModelAccessibility('models/model-trozoba.glb');
    if (workingPath && workingPath !== window.AR_CONFIG.model.file) {
      console.log(`🔄 Atualizando caminho do modelo de "${window.AR_CONFIG.model.file}" para "${workingPath}"`);
      window.AR_CONFIG.model.file = workingPath;
    } else if (workingPath) {
      console.log(`✅ Caminho do modelo confirmado: ${workingPath}`);
    } else {
      console.log(`❌ Nenhum caminho funcionou para o modelo`);
    }
    
    // Também verifica a estrutura de arquivos
    await window.AR_UTILS.debugFileStructure();
  }, 1000);
}

// Log de inicialização
console.log('🎭 AR Config carregado:', window.AR_CONFIG);
console.log('📱 Suporte a sensores:', window.AR_UTILS.supportsSensors());
console.log('📹 Suporte a câmera:', window.AR_UTILS.supportsCamera());
console.log('🌐 Suporte a WebXR:', window.AR_UTILS.supportsWebXR());
console.log('📱 É dispositivo móvel:', window.AR_UTILS.isMobile());
console.log('🔧 Caminho do modelo:', window.AR_CONFIG.model.file);
console.log('📍 URL atual:', window.location.href);
console.log('🌍 Hostname:', window.location.hostname);
console.log('📁 Pathname:', window.location.pathname);
console.log('🏠 Origin:', window.location.origin);
