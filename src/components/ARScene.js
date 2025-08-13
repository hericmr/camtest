import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ARScene = () => {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const markerRootRef = useRef(null);

  useEffect(() => {
    // Configuração do Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color('lightblue'), 0.3);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    renderer.domElement.style.zIndex = '-2';

    // Adiciona o renderer ao DOM
    if (sceneRef.current) {
      sceneRef.current.appendChild(renderer.domElement);
    }

    // Cria um marcador virtual (simulação de AR)
    const markerRoot = new THREE.Group();
    scene.add(markerRoot);

    // Cria um objeto 3D simples (cubo)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -5);
    markerRoot.add(cube);

    // Adiciona uma esfera
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0, -5);
    markerRoot.add(sphere);

    // Adiciona uma luz
    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);

    // Adiciona luz direcional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Posiciona a câmera
    camera.position.z = 5;

    // Função de renderização
    const render = () => {
      requestAnimationFrame(render);
      
      // Rotação dos objetos
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      sphere.rotation.x += 0.02;
      
      renderer.render(scene, camera);
    };

    render();

    // Atualiza referências
    rendererRef.current = renderer;
    cameraRef.current = camera;
    markerRootRef.current = markerRoot;

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
  }, []);

  // Função para adicionar novos objetos 3D
  const addObject = () => {
    if (markerRootRef.current) {
      const geometry = new THREE.ConeGeometry(0.5, 1, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const cone = new THREE.Mesh(geometry, material);
      cone.position.set(-2, 0, -5);
      markerRootRef.current.add(cone);
    }
  };

  // Função para alternar entre modo AR e visualização 3D
  const toggleMode = () => {
    if (sceneRef.current) {
      const canvas = sceneRef.current.querySelector('canvas');
      if (canvas) {
        if (canvas.style.zIndex === '-2') {
          canvas.style.zIndex = '1';
        } else {
          canvas.style.zIndex = '-2';
        }
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={sceneRef} style={{ width: '100%', height: '100%' }} />
      
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
        <h3 style={{ margin: '0 0 15px 0' }}>🎯 AR Scene Demo</h3>
        <button 
          onClick={addObject}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            fontSize: '14px'
          }}
        >
          ➕ Adicionar Cone
        </button>
        <button 
          onClick={toggleMode}
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
          🔄 Alternar Modo
        </button>
        <p style={{ margin: '15px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
          📱 Use em dispositivo móvel para melhor experiência
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
          <li>Clique em "Adicionar Cone" para criar novos objetos</li>
          <li>Use "Alternar Modo" para ver apenas os objetos 3D</li>
          <li>Mova o dispositivo para ver os objetos de diferentes ângulos</li>
        </ul>
      </div>
    </div>
  );
};

export default ARScene;
