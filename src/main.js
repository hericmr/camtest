// AR.js com A-Frame para localização
// Os scripts são carregados via CDN no HTML

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
    
    // Cria a caixa vermelha
    const box = document.createElement('a-box');
    box.setAttribute('position', '0 0 -10');
    box.setAttribute('geometry', 'width: 2; height: 2; depth: 2');
    box.setAttribute('material', 'color: red');
    box.setAttribute('gps-entity-place', 'latitude: -46.31637363516056; longitude: -23.97882477971589');
    
    // Adiciona a caixa à cena
    scene.appendChild(box);
    
    // Adiciona informações de debug
    const info = document.getElementById('info');
    if (info) {
        info.innerHTML = `
            <h3>🎯 AR.js - Hello World</h3>
            <div>📍 Localização: -23.978824, -46.316374</div>
            <div>🎲 Objeto: Caixa vermelha a 10m ao norte</div>
            <div>📱 Use em dispositivo móvel com GPS</div>
            <div>🌐 A-Frame + AR.js</div>
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
