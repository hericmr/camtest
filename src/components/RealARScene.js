import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Webcam from 'react-webcam';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const RealARScene = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const objectsRef = useRef([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [webcamConstraints, setWebcamConstraints] = useState({
    width: 1280,
    height: 720,
    facingMode: 'environment'
  });

  useEffect(() => {
    // Verifica se o navegador suporta WebGL
    if (!window.WebGLRenderingContext) {
      setError('Seu navegador não suporta WebGL. Use um navegador mais moderno.');
      return;
    }

    // Aguarda o próximo frame para garantir que o DOM esteja pronto
    const initThreeJS = () => {
      if (!canvasRef.current || !sceneRef.current) {
        requestAnimationFrame(initThreeJS);
        return;
      }

      try {
        // Configuração do Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          canvas: canvasRef.current
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(new THREE.Color('transparent'), 0);

        // Posiciona a câmera
        camera.position.z = 5;

        // Função de renderização
        const animate = () => {
          requestAnimationFrame(animate);
          
          // Rotação dos objetos existentes
          objectsRef.current.forEach(obj => {
            if (obj.mesh) {
              obj.mesh.rotation.x += 0.01;
              obj.mesh.rotation.y += 0.01;
            }
          });
          
          renderer.render(scene, camera);
        };

        animate();

        // Atualiza referências
        rendererRef.current = renderer;
        cameraRef.current = camera;
        sceneRef.current = scene;

        // Função para redimensionar
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
          if (rendererRef.current) {
            rendererRef.current.dispose();
          }
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.error('Erro ao inicializar Three.js:', err);
        setError('Erro ao inicializar a cena 3D: ' + err.message);
      }
    };

    initThreeJS();
  }, []);

  // Função para ativar a câmera
  const startCamera = useCallback(() => {
    setIsCameraActive(true);
    setError('');
  }, []);

  // Função para parar a câmera
  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
  }, []);

  // Função para carregar o modelo 3D trozoba.glb
  const loadTrozobaModel = () => {
    if (!sceneRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    
    // Cria o loader GLTF
    const loader = new GLTFLoader();
    
    // Carrega o modelo trozoba.glb
    loader.load(
      `${process.env.PUBLIC_URL}/trozoba.glb`,
      (gltf) => {
        const model = gltf.scene;
        
        // Posiciona o modelo no centro da tela
        model.position.set(0, 0, -5);
        
        // Aumenta o tamanho do modelo
        model.scale.set(3, 3, 3);
        
        // Adiciona o modelo à cena
        scene.add(model);
        
        // Adiciona à lista de objetos
        objectsRef.current.push({
          mesh: model,
          type: 'trozoba',
          id: Date.now()
        });
        
        console.log('Modelo trozoba.glb carregado com sucesso!');
      },
      (progress) => {
        console.log('Carregando modelo...', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Erro ao carregar o modelo:', error);
        setError('Erro ao carregar o modelo 3D: ' + error.message);
      }
    );
  };

  // Função para limpar todos os objetos
  const clearObjects = () => {
    if (!sceneRef.current) return;

    try {
      const scene = sceneRef.current;
      objectsRef.current.forEach(obj => {
        if (obj.mesh && scene) {
          scene.remove(obj.mesh);
          // Verifica se o objeto tem geometria e material antes de disposar
          if (obj.mesh.geometry) {
            obj.mesh.geometry.dispose();
          }
          if (obj.mesh.material) {
            if (Array.isArray(obj.mesh.material)) {
              obj.mesh.material.forEach(mat => mat.dispose());
            } else {
              obj.mesh.material.dispose();
            }
          }
        }
      });
      objectsRef.current = [];
    } catch (err) {
      console.error('Erro ao limpar objetos:', err);
      setError('Erro ao limpar objetos: ' + err.message);
    }
  };

  // Função para alternar visibilidade dos objetos
  const toggleObjectsVisibility = () => {
    try {
      const canvas = canvasRef.current;
      if (canvas && canvas.style) {
        if (canvas.style.display === 'none') {
          canvas.style.display = 'block';
        } else {
          canvas.style.display = 'none';
        }
      }
    } catch (err) {
      console.error('Erro ao alternar visibilidade:', err);
      setError('Erro ao alternar visibilidade: ' + err.message);
    }
  };

  // Função para alternar entre câmera frontal e traseira
  const toggleCamera = useCallback(() => {
    setWebcamConstraints(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'environment' ? 'user' : 'environment'
    }));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Webcam */}
      {isCameraActive && (
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={webcamConstraints}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1
          }}
          onUserMedia={() => setIsCameraActive(true)}
          onUserMediaError={(err) => {
            setError('Erro ao acessar a câmera: ' + err.message);
            setIsCameraActive(false);
          }}
        />
      )}

      {/* Canvas do Three.js */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />

      {/* Container da cena */}
      <div ref={sceneRef} style={{ width: '100%', height: '100%' }} />

      {/* Controles principais */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        minWidth: '250px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>🎭 AR Trozoba</h3>
        
        {/* Controles da câmera */}
        <div style={{ marginBottom: '20px' }}>
          {!isCameraActive ? (
            <button 
              onClick={startCamera}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🎥 Ativar Câmera
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={stopCamera}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ⏹️ Parar Câmera
              </button>
              <button 
                onClick={toggleCamera}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Trocar Câmera
              </button>
            </div>
          )}
        </div>

        {/* Controles dos objetos */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>🎯 Modelo 3D:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={loadTrozobaModel}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🎭 Carregar Trozoba
            </button>
            <button 
              onClick={clearObjects}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Remover Modelo
            </button>
          </div>
        </div>

        {/* Controles de visibilidade */}
        <div>
          <button 
            onClick={toggleObjectsVisibility}
            style={{
              background: '#fd7e14',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px'
            }}
          >
            👁️ Alternar Objetos
          </button>
        </div>

        {/* Status */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: isCameraActive ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
          borderRadius: '5px',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          {isCameraActive ? '🟢 Câmera ativa' : '🔴 Câmera inativa'}
        </div>
        
        {/* Dicas para câmera */}
        {!isCameraActive && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: 'rgba(255, 193, 7, 0.2)',
            borderRadius: '5px',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            💡 Dica: Clique em "Ativar Câmera" para começar
          </div>
        )}

        {/* Contador de objetos */}
        <div style={{ 
          marginTop: '10px', 
          textAlign: 'center', 
          fontSize: '12px',
          opacity: 0.8
        }}>
          Modelo: {objectsRef.current.length > 0 ? 'Carregado' : 'Não carregado'}
        </div>
      </div>

      {/* Instruções */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h4 style={{ margin: '0 0 15px 0' }}>🚀 Como usar:</h4>
        <ul style={{ 
          margin: '0', 
          padding: '0 0 0 20px', 
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <li>Clique em "Ativar Câmera" para usar a câmera do dispositivo</li>
          <li>Clique em "Carregar Trozoba" para adicionar o modelo 3D</li>
          <li>O modelo aparecerá sobreposto ao vídeo da câmera</li>
          <li>Use "Alternar Objetos" para mostrar/ocultar o modelo 3D</li>
          <li>Use "Trocar Câmera" para alternar entre frontal e traseira</li>
        </ul>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          background: 'rgba(220, 53, 69, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>⚠️ Erro</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
          <button 
            onClick={() => setError('')}
            style={{
              background: 'white',
              color: '#dc3545',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '15px',
              fontSize: '14px'
            }}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

export default RealARScene;
