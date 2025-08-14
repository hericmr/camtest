// AR.js com A-Frame para localização
// Os scripts são carregados via CDN no HTML
import { LOCATION_CONFIG, getUserLocationFormatted, getObjectLocationFormatted } from './config.js';

// Aguarda o A-Frame carregar
document.addEventListener('DOMContentLoaded', () => {
    // Cria a cena A-Frame
    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');
    
    // Adiciona a cena ao body
    document.body.appendChild(scene);
    
    // Cria a câmera GPS
    const camera = document.createElement('a-entity');
    camera.setAttribute('gps-camera', '');
    camera.setAttribute('gps-camera-rotation-reader', '');
    scene.appendChild(camera);
    
    // Cria a caixa vermelha usando configurações
    const box = document.createElement('a-box');
    box.setAttribute('position', `${LOCATION_CONFIG.arObject.position.x} ${LOCATION_CONFIG.arObject.position.y} ${LOCATION_CONFIG.arObject.position.z}`);
    box.setAttribute('geometry', `width: ${LOCATION_CONFIG.arObject.geometry.width}; height: ${LOCATION_CONFIG.arObject.geometry.height}; depth: ${LOCATION_CONFIG.arObject.geometry.depth}`);
    box.setAttribute('material', `color: ${LOCATION_CONFIG.arObject.material.color}`);
    box.setAttribute('gps-entity-place', `latitude: ${LOCATION_CONFIG.objectLocation.latitude}; longitude: ${LOCATION_CONFIG.objectLocation.longitude}`);
    
    // Adiciona a caixa à cena
    scene.appendChild(box);
    
    // Adiciona informações de debug usando configurações
    const info = document.getElementById('info');
    if (info) {
        info.innerHTML = `
            <h3>🎯 AR.js - Hello World</h3>
            <div>📍 Localização: <span id="user-location">${getUserLocationFormatted()}</span></div>
            <div>🎲 Objeto: ${LOCATION_CONFIG.objectLocation.description}</div>
            <div>📱 Use em dispositivo móvel com GPS</div>
            <div>🌐 A-Frame + AR.js</div>
            <div>🌍 ${LOCATION_CONFIG.userLocation.description}</div>
        `;
    }
    
    // Adiciona controles de mouse para desktop
    let isMouseDown = false;
    let lastMouseX = 0;
    
    document.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        lastMouseX = e.clientX;
    });
    
    document.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        const deltaX = e.clientX - lastMouseX;
        const rotationY = deltaX * 0.01;
        
        // Rotaciona a câmera
        const cameraRotation = camera.getAttribute('rotation');
        cameraRotation.y += rotationY;
        camera.setAttribute('rotation', cameraRotation);
        
        lastMouseX = e.clientX;
    });
    
    console.log('🎉 AR.js Hello World carregado com sucesso!');
});
