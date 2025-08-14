import * as THREE from 'three';
import * as LocAR from 'locar';

// ========================================
// CONFIGURAÇÃO BÁSICA THREE.JS
// ========================================

// Criação da cena principal
const scene = new THREE.Scene();

// Configuração da câmera perspectiva
const camera = new THREE.PerspectiveCamera(
    60,                                    // Campo de visão (FOV)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.001,                                 // Near plane (muito próximo para AR)
    100                                    // Far plane
);

// Configuração do renderizador WebGL
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,                       // Suavização de bordas
    alpha: true                            // Fundo transparente
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Melhor qualidade em telas Retina
document.body.appendChild(renderer.domElement);

// ========================================
// RESPONSIVIDADE
// ========================================

window.addEventListener("resize", () => {
    // Atualiza tamanho do renderizador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Atualiza aspect ratio da câmera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    console.log('Tela redimensionada:', window.innerWidth, 'x', window.innerHeight);
});

// ========================================
// CRIAÇÃO DO OBJETO 3D
// ========================================

// Geometria: cubo 2x2x2 metros
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);

// Material: vermelho básico (sem necessidade de iluminação)
const boxMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,           // Vermelho
    wireframe: false,          // Sólido, não apenas wireframe
    transparent: false         // Opaco
});

// Mesh: combinação de geometria + material
const redCube = new THREE.Mesh(boxGeometry, boxMaterial);

// ========================================
// CONFIGURAÇÃO LOCAR.JS
// ========================================

// Inicialização do gerenciador de localização AR
const locationManager = new LocAR.LocationBased(scene, camera);

// Configuração da webcam
const webcam = new LocAR.Webcam({
    idealWidth: 1024,          // Largura ideal do vídeo
    idealHeight: 768,          // Altura ideal do vídeo
    
    // Callback executado quando a webcam está pronta
    onVideoStarted: (videoTexture) => {
        // Define o vídeo da webcam como fundo da cena
        scene.background = videoTexture;
        
        // Remove indicador de loading
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        console.log('Webcam inicializada com sucesso!');
        console.log('Resolução do vídeo:', videoTexture.image.videoWidth, 'x', videoTexture.image.videoHeight);
    }
});

// ========================================
// POSICIONAMENTO GEOGRÁFICO
// ========================================

// Coordenadas de exemplo (Greenwich, Londres)
const LONGITUDE_BASE = -0.72;    // Longitude base
const LATITUDE_BASE = 51.05;     // Latitude base

// Define posição "falsa" do usuário (GPS simulado)
locationManager.fakeGps(LONGITUDE_BASE, LATITUDE_BASE);

// Adiciona o cubo ligeiramente ao norte da posição do usuário
locationManager.add(
    redCube,                     // Objeto 3D
    LONGITUDE_BASE,              // Mesma longitude
    LATITUDE_BASE + 0.0001       // Ligeiramente ao norte (~11 metros)
);

console.log('Cubo posicionado em:', {
    longitude: LONGITUDE_BASE,
    latitude: LATITUDE_BASE + 0.0001,
    offset: '~11 metros ao norte'
});

// ========================================
// CONTROLES DE MOUSE PARA DESKTOP
// ========================================

// Configurações de rotação
const ROTATION_STEP = THREE.MathUtils.degToRad(2); // 2 graus por movimento

// Variáveis de controle
let isMouseDown = false;
let lastMouseX = 0;

// Event listeners para mouse
window.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    console.log('Mouse pressionado');
});

window.addEventListener("mouseup", () => {
    isMouseDown = false;
    console.log('Mouse liberado');
});

window.addEventListener("mousemove", (event) => {
    // Só processa se o mouse estiver pressionado
    if (!isMouseDown) return;
    
    const currentMouseX = event.clientX;
    const deltaX = currentMouseX - lastMouseX;
    
    if (deltaX < 0) {
        // Movimento para esquerda: rotaciona no sentido anti-horário
        camera.rotation.y -= ROTATION_STEP;
        
        // Mantém rotação no intervalo [0, 2π]
        if (camera.rotation.y < 0) {
            camera.rotation.y += 2 * Math.PI;
        }
    } else if (deltaX > 0) {
        // Movimento para direita: rotaciona no sentido horário
        camera.rotation.y += ROTATION_STEP;
        
        // Mantém rotação no intervalo [0, 2π]
        if (camera.rotation.y > 2 * Math.PI) {
            camera.rotation.y -= 2 * Math.PI;
        }
    }
    
    lastMouseX = currentMouseX;
    
    // Log para debugging
    const rotationDegrees = THREE.MathUtils.radToDeg(camera.rotation.y);
    console.log('Rotação da câmera:', rotationDegrees.toFixed(1), '°');
});

// Informações para o usuário
console.log('💡 Controles de mouse ativados!');
console.log('   - Clique e arraste para rotacionar a câmera');
console.log('   - O cubo deve aparecer ao norte (rotação ~0°)');

// ========================================
// LOOP DE RENDERIZAÇÃO
// ========================================

// Define função de animação contínua
function animate() {
    // Renderiza a cena
    renderer.render(scene, camera);
    
    // Opcional: adicionar rotação ao cubo para visualização
    // redCube.rotation.y += 0.01;
}

// Inicia o loop de renderização
renderer.setAnimationLoop(animate);

console.log('Sistema AR inicializado!');
console.log('Posição do usuário (simulada):', LONGITUDE_BASE, LATITUDE_BASE);
