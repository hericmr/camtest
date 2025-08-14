import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const AdvancedARScene = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);
  
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [sensorPermission, setSensorPermission] = useState('prompt');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sensorCalibration, setSensorCalibration] = useState(null);
  
  // Referências para sensores
  const deviceOrientationRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const deviceMotionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastUpdateTimeRef = useRef(0);

  // Configurações do modelo AR (usa configurações globais se disponíveis)
  const AR_CONFIG = useMemo(() => {
    const globalConfig = window.AR_CONFIG || {};
    return {
      // Propriedades de compatibilidade (mantidas para compatibilidade com código existente)
      modelScale: 5.0, // Aumentado de 2.5 para 5.0
      modelPosition: { x: 0, y: -1, z: -3 },
      modelRotation: { x: 0, y: 0, z: 0 },
      sensorSensitivity: 0.5,
      autoLoad: true,
      
      // Mescla com configurações globais
      ...globalConfig,
      
      // Garante que as propriedades do modelo existam
      model: {
        scale: 5.0, // Aumentado de 2.5 para 5.0
        position: { x: 0, y: -1, z: -3 },
        rotation: { x: 0, y: 0, z: 0 },
        autoLoad: true,
        color: 0x000000, // Cor preta padrão
        ...globalConfig.model
      },
      
      // Garante que as configurações de sensores existam
      sensors: {
        sensitivity: 0.5,
        ...globalConfig.sensors
      }
    };
  }, []);

  // Inicialização automática da câmera
  const initializeCamera = useCallback(async () => {
    try {
      // Verifica permissões da câmera
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(permission.state);
          
          if (permission.state === 'denied') {
            throw new Error('Permissão da câmera negada pelo usuário');
          }
        } catch (permErr) {
          console.warn('Erro ao verificar permissões:', permErr);
          // Continua mesmo se não conseguir verificar permissões
        }
      }

      // Configurações da câmera (usa configurações globais se disponíveis)
      const cameraConfig = window.AR_CONFIG?.camera || {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
        aspectRatio: { ideal: 16/9 }
      };

      // Tenta diferentes configurações de câmera se a primeira falhar
      const tryCameraConfigs = [
        cameraConfig,
        { 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'environment'
          },
          audio: false 
        },
        { 
          video: { 
            width: { ideal: 320 }, 
            height: { ideal: 240 },
            facingMode: 'environment'
          },
          audio: false 
        },
        { 
          video: { 
            facingMode: 'environment'
          },
          audio: false 
        }
      ];

      let stream = null;
      let lastError = null;

      // Tenta cada configuração até uma funcionar
      for (const config of tryCameraConfigs) {
        try {
          console.log('Tentando configuração de câmera:', config);
          stream = await navigator.mediaDevices.getUserMedia(config);
          console.log('Câmera inicializada com sucesso');
          break;
        } catch (err) {
          lastError = err;
          console.warn('Falha na configuração de câmera:', err.name, err.message);
          
          // Se for erro de permissão negada, para de tentar
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            throw new Error('Permissão da câmera negada pelo usuário');
          }
          
          // Se for erro de dispositivo não encontrado, tenta próxima configuração
          if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            continue;
          }
          
          // Para outros erros, tenta próxima configuração
          continue;
        }
      }

      if (!stream) {
        throw new Error(`Não foi possível acessar a câmera: ${lastError?.message || 'Erro desconhecido'}`);
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Adiciona tratamento de erro para o elemento de vídeo
        videoRef.current.onerror = (err) => {
          console.error('Erro no elemento de vídeo:', err);
          setError('Erro no elemento de vídeo da câmera');
        };

        // Aguarda o vídeo estar pronto com timeout
        try {
          await Promise.race([
            new Promise((resolve) => {
              if (videoRef.current) {
                videoRef.current.onloadedmetadata = resolve;
              }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout ao carregar vídeo')), 10000)
            )
          ]);
        } catch (timeoutErr) {
          console.warn('Timeout ao carregar vídeo, continuando...');
          // Continua mesmo com timeout
        }

        // Tenta reproduzir o vídeo
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Erro ao reproduzir vídeo:', playErr);
          // Continua mesmo se não conseguir reproduzir automaticamente
        }
      }

      setCameraPermission('granted');
      return true;
    } catch (err) {
      console.error('Erro ao inicializar câmera:', err);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = 'Erro ao acessar câmera';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão da câmera negada. Por favor, permita o acesso à câmera e recarregue a página.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo. Feche outros apps que usem a câmera.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Configuração da câmera não suportada pelo dispositivo.';
      } else if (err.message.includes('fetching process') || err.message.includes('aborted')) {
        errorMessage = 'Processo de inicialização da câmera foi interrompido. Tente novamente.';
      } else {
        errorMessage = `Erro ao acessar câmera: ${err.message}`;
      }
      
      setError(errorMessage);
      setCameraPermission('denied');
      return false;
    }
  }, []);

  // Calibração dos sensores
  const calibrateSensors = useCallback(async () => {
    if (window.AR_UTILS && window.AR_UTILS.calibrateSensors) {
      try {
        const calibration = await window.AR_UTILS.calibrateSensors();
        setSensorCalibration(calibration);
        console.log('Sensores calibrados:', calibration);
      } catch (err) {
        console.warn('Erro na calibração dos sensores:', err);
      }
    }
  }, []);

  // Inicialização dos sensores do dispositivo
  const initializeSensors = useCallback(() => {
    try {
      // Device Orientation (giroscópio, acelerômetro)
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
          const now = performance.now();
          const timeDelta = now - lastUpdateTimeRef.current;
          
          // Limita a taxa de atualização para melhor performance
          if (timeDelta > (1000 / (window.AR_CONFIG?.sensors?.updateRate || 60))) {
            deviceOrientationRef.current = {
              alpha: event.alpha || 0,    // Rotação Z (bússola)
              beta: event.beta || 0,      // Rotação X (inclinação frontal/traseira)
              gamma: event.gamma || 0     // Rotação Y (inclinação lateral)
            };
            lastUpdateTimeRef.current = now;
          }
        });
        setSensorPermission('granted');
      } else {
        console.warn('DeviceOrientation não suportado');
        setSensorPermission('unsupported');
      }

      // Device Motion (acelerômetro)
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
          if (event.accelerationIncludingGravity) {
            deviceMotionRef.current = {
              x: event.accelerationIncludingGravity.x || 0,
              y: event.accelerationIncludingGravity.y || 0,
              z: event.accelerationIncludingGravity.z || 0
            };
          }
        });
      }

      // Permissões para sensores (iOS 13+)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permission => {
            if (permission === 'granted') {
              setSensorPermission('granted');
              // Calibra os sensores após permissão concedida
              calibrateSensors();
            } else {
              setSensorPermission('denied');
            }
          })
          .catch(err => {
            console.warn('Erro ao solicitar permissão dos sensores:', err);
            setSensorPermission('denied');
          });
      } else {
        // Para dispositivos que não precisam de permissão, calibra imediatamente
        calibrateSensors();
      }

      return true;
    } catch (err) {
      console.error('Erro ao inicializar sensores:', err);
      setSensorPermission('error');
      return false;
    }
  }, [calibrateSensors]);

  // Inicialização do Three.js
  const initializeThreeJS = useCallback(() => {
    try {
      if (!canvasRef.current) return false;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      // Configura o renderer com configurações globais se disponíveis
      const rendererConfig = window.AR_CONFIG?.rendering || {
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
      camera.position.z = 5;

      // Adiciona iluminação baseada nas configurações globais
      const lightingConfig = window.AR_CONFIG?.lighting || {
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
  }, []);

  // Carregamento automático do modelo 3D
  const loadModel = useCallback(async () => {
    if (!sceneRef.current) return false;
    
    // Verifica se o modelo já está carregado para evitar duplicação
    if (modelRef.current) {
      console.log('⚠️ Modelo já está carregado, ignorando chamada duplicada');
      return true;
    }

    // Aguarda o carregamento do ar-config.js
    if (!window.AR_UTILS || !window.AR_UTILS.getModelPath) {
      console.log('⏳ Aguardando carregamento do ar-config.js...');
      await new Promise(resolve => {
        const checkARUtils = () => {
          if (window.AR_UTILS && window.AR_UTILS.getModelPath) {
            console.log('✅ ar-config.js carregado');
            resolve();
          } else {
            setTimeout(checkARUtils, 100);
          }
        };
        checkARUtils();
      });
    }

    // Declara variáveis no escopo da função para que sejam acessíveis no catch
    let modelConfig = window.AR_CONFIG?.model || AR_CONFIG;
    let modelFile = modelConfig.file || (window.AR_UTILS?.getModelPath ? window.AR_UTILS.getModelPath('models/model-trozoba.glb') : 'models/model-trozoba.glb');
    let finalModelFile = modelFile; // Variável para armazenar o caminho final

    try {
      setIsLoading(true);
      
      const loader = new GLTFLoader();
      
      console.log('Tentando carregar modelo de:', modelFile);
      console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
      console.log('Configuração do modelo:', modelConfig);
      console.log('URL atual:', window.location.href);
      console.log('Base URL:', window.location.origin + window.location.pathname);
      console.log('AR_CONFIG disponível:', !!window.AR_CONFIG);
      console.log('AR_UTILS disponível:', !!window.AR_UTILS);
      if (window.AR_UTILS) {
        console.log('getModelPath disponível:', !!window.AR_UTILS.getModelPath);
        console.log('testModelAccessibility disponível:', !!window.AR_UTILS.testModelAccessibility);
      }
      
      // Verifica se o arquivo existe fazendo uma requisição HEAD
      try {
        console.log('🔍 Verificando arquivo:', modelFile);
        const response = await fetch(modelFile, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Arquivo não encontrado: ${response.status} ${response.statusText}`);
        }
        console.log('✅ Arquivo encontrado, tamanho:', response.headers.get('content-length'), 'bytes');
        console.log('📍 URL completa:', response.url);
      } catch (fetchErr) {
        console.warn('⚠️ Erro ao verificar arquivo:', fetchErr);
        console.log('💡 Tentando caminhos alternativos...');
        
        // Se temos a função de teste de acessibilidade, usa ela
        if (window.AR_UTILS?.testModelAccessibility) {
          console.log('🧪 Usando função de teste de acessibilidade...');
          const workingPath = await window.AR_UTILS.testModelAccessibility('models/model-trozoba.glb');
          if (workingPath) {
            console.log('✅ Caminho alternativo encontrado:', workingPath);
            finalModelFile = workingPath;
            modelConfig.file = workingPath;
          }
        } else {
          // Fallback para caminhos alternativos básicos
          const alternativePaths = [
            `./${modelFile}`,
            `/${modelFile}`,
            `${window.location.origin}${window.location.pathname}${modelFile}`,
            `${window.location.origin}${modelFile}`
          ];
          
          for (const altPath of alternativePaths) {
            try {
              console.log('🔄 Tentando caminho alternativo:', altPath);
              const altResponse = await fetch(altPath, { method: 'HEAD' });
              if (altResponse.ok) {
                console.log('✅ Caminho alternativo funcionou:', altPath);
                // Atualiza o caminho do modelo
                finalModelFile = altPath;
                modelConfig.file = altPath;
                break;
              }
            } catch (altErr) {
              console.log('❌ Caminho alternativo falhou:', altPath, altErr.message);
            }
          }
        }
      }
      
      // Usa o caminho atualizado se foi encontrado um caminho alternativo
      finalModelFile = modelConfig.file || modelFile;
      console.log('🎯 Caminho final do modelo:', finalModelFile);
      
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          finalModelFile,
          (gltf) => {
            console.log('Modelo carregado com sucesso:', gltf);
            resolve(gltf);
          },
          (progress) => {
            if (progress.total > 0) {
              console.log('Carregando modelo:', Math.round(progress.loaded / progress.total * 100) + '%');
            } else {
              console.log('Carregando modelo...', progress.loaded, 'bytes');
            }
          },
          (error) => {
            console.error('Erro detalhado ao carregar modelo:', error);
            reject(error);
          }
        );
      });

      const model = gltf.scene;
      
      // Aplica configurações do modelo
      model.scale.setScalar(modelConfig.scale || AR_CONFIG.model.scale);
      model.position.set(
        modelConfig.position.x || AR_CONFIG.model.position.x,
        modelConfig.position.y || AR_CONFIG.model.position.y,
        modelConfig.position.z || AR_CONFIG.model.position.z
      );
      model.rotation.set(
        modelConfig.rotation.x || AR_CONFIG.model.rotation.x,
        modelConfig.rotation.y || AR_CONFIG.model.rotation.y,
        modelConfig.rotation.z || AR_CONFIG.model.rotation.z
      );

      // Aplica cor ao modelo (usa configuração ou padrão preto)
      const modelColor = modelConfig.color || AR_CONFIG.model.color || 0x000000;
      const applyColor = (object) => {
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              if (mat.color) {
                mat.color.setHex(modelColor);
                mat.needsUpdate = true;
              }
            });
          } else {
            if (object.material.color) {
              object.material.color.setHex(modelColor);
              object.material.needsUpdate = true;
            }
          }
        }
        
        // Recursivamente aplica a todos os filhos
        object.children.forEach(child => applyColor(child));
      };
      
      applyColor(model);
      console.log(`🎨 Cor aplicada ao modelo: #${modelColor.toString(16).padStart(6, '0')}`);

      // Adiciona o modelo à cena
      sceneRef.current.add(model);
      modelRef.current = model;

      console.log('Modelo Trozoba carregado com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro ao carregar modelo:', err);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = 'Erro ao carregar modelo 3D';
      
      if (err.message.includes('JSON.parse')) {
        errorMessage = 'Erro no formato do arquivo GLB. Verifique se o arquivo está correto.';
      } else if (err.message.includes('404') || err.message.includes('Not Found')) {
        errorMessage = `Arquivo do modelo não encontrado (404). Tentou carregar de: ${finalModelFile}`;
      } else if (err.message.includes('fetch')) {
        errorMessage = `Erro ao baixar o arquivo do modelo. Tentou carregar de: ${finalModelFile}`;
      } else if (err.message.includes('Arquivo não encontrado')) {
        errorMessage = `Arquivo não encontrado: ${err.message}. Tentou carregar de: ${finalModelFile}`;
      } else {
        errorMessage = `Erro ao carregar modelo 3D: ${err.message}. Tentou carregar de: ${finalModelFile}`;
      }
      
      // Adiciona informações de debug adicionais
      console.log('🔍 Debug do erro:');
      console.log('  - Modelo tentado:', finalModelFile);
      console.log('  - Configuração atual:', modelConfig);
      console.log('  - AR_CONFIG disponível:', !!window.AR_CONFIG);
      console.log('  - AR_UTILS disponível:', !!window.AR_UTILS);
      if (window.AR_UTILS) {
        console.log('  - getModelPath:', window.AR_UTILS.getModelPath('trozoba.glb'));
        console.log('  - getBasePath:', window.AR_UTILS.getBasePath());
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [AR_CONFIG]);

  // Loop de renderização com integração de sensores
  const renderLoop = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Atualiza posição da câmera baseada nos sensores
    if (sensorPermission === 'granted' && modelRef.current) {
      const orientation = deviceOrientationRef.current;
      const motion = deviceMotionRef.current;
      const sensitivity = window.AR_CONFIG?.sensors?.sensitivity || AR_CONFIG.sensorSensitivity;

      // Aplica rotação baseada no giroscópio
      if (modelRef.current) {
        // Rotação baseada no device orientation
        modelRef.current.rotation.y = THREE.MathUtils.degToRad(orientation.alpha) * sensitivity;
        modelRef.current.rotation.x = THREE.MathUtils.degToRad(orientation.beta - 90) * sensitivity;
        
        // Movimento sutil baseado no acelerômetro
        const motionOffset = 0.1;
        modelRef.current.position.x += (motion.x * motionOffset - modelRef.current.position.x) * 0.1;
        modelRef.current.position.y += (-motion.y * motionOffset - modelRef.current.position.y) * 0.1;
      }
    }

    // Renderiza a cena
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    requestAnimationFrame(renderLoop);
  }, [sensorPermission, AR_CONFIG.sensorSensitivity]);

  // Inicialização completa
  useEffect(() => {
    const initializeAR = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Verifica suporte a recursos
        if (window.AR_UTILS) {
          if (!window.AR_UTILS.supportsWebGL()) {
            throw new Error('Seu navegador não suporta WebGL. Use um navegador mais moderno.');
          }
        }

        // Inicializa Three.js primeiro (não depende da câmera)
        const threeOk = initializeThreeJS();
        if (!threeOk) {
          throw new Error('Falha ao inicializar renderização 3D');
        }

        // Inicializa sensores
        initializeSensors();

        // Tenta inicializar a câmera (opcional)
        let cameraOk = false;
        try {
          cameraOk = await initializeCamera();
        } catch (cameraErr) {
          console.warn('Câmera não disponível, continuando sem câmera:', cameraErr);
          // Continua sem câmera
        }

        // Carrega o modelo automaticamente se configurado
        const shouldAutoLoad = window.AR_CONFIG?.model?.autoLoad ?? AR_CONFIG.autoLoad;
        if (shouldAutoLoad) {
          await loadModel();
        }

        // Inicia o loop de renderização
        renderLoop();

        console.log('AR inicializado com sucesso!', { camera: cameraOk, three: threeOk });
      } catch (err) {
        console.error('Erro na inicialização:', err);
        setError(`Erro na inicialização: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAR();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initializeCamera, initializeSensors, initializeThreeJS, loadModel, renderLoop, AR_CONFIG.autoLoad]);

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

  // Função para alternar entre modo câmera e modo 3D
  const toggleCameraMode = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.style.display === 'none') {
        videoRef.current.style.display = 'block';
        setError('');
      } else {
        videoRef.current.style.display = 'none';
        setError('Modo 3D ativo - Câmera desabilitada');
      }
    }
  }, []);

  // Função para reinicializar a câmera
  const retryCamera = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    // Para o stream atual se existir
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reinicializa a câmera
    const success = await initializeCamera();
    if (success) {
      // Se a câmera funcionar, carrega o modelo se não estiver carregado
      if (!modelRef.current && AR_CONFIG.autoLoad) {
        await loadModel();
      }
    }
    
    setIsLoading(false);
  }, [initializeCamera, loadModel, AR_CONFIG.autoLoad]);

  // Função para recarregar o modelo
  const reloadModel = useCallback(async () => {
    if (modelRef.current && sceneRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    await loadModel();
  }, [loadModel]);

  // Função para alternar câmera
  const toggleCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    const newConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user', // Alterna para câmera frontal
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(newConstraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(`Erro ao alternar câmera: ${err.message}`);
    }
  }, []);

  // Função para recalibrar sensores
  const recalibrateSensors = useCallback(() => {
    calibrateSensors();
  }, [calibrateSensors]);

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
          zIndex: 100,
          color: 'white'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>🎭</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Inicializando AR...</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Aguarde um momento</div>
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
          
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {error.includes('câmera') && (
              <button 
                onClick={retryCamera}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Tentar Novamente
              </button>
            )}
            
            <button 
              onClick={() => setError('')}
              style={{
                background: 'white',
                color: '#dc3545',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Fechar
            </button>
          </div>
          
          {/* Dicas de solução */}
          {(error.includes('fetching process') || error.includes('aborted')) && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '5px',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              <strong>💡 Dicas para resolver:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Verifique se o site está em HTTPS</li>
                <li>Confirme as permissões da câmera no navegador</li>
                <li>Feche outros apps que usem a câmera</li>
                <li>Tente recarregar a página</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedARScene;
