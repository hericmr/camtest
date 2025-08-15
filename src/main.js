import * as THREE from 'three';
import * as LocAR from 'locar';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const locar = new LocAR.LocationBased(scene, camera);

// ✨ Variável global para o modelo trozoba.glb
let trozobaModel = null;

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);


// Responsividade
window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Configuração da webcam
const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
});

let firstLocation = true; // Flag para executar apenas uma vez

const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

// ✨ Listener para atualizações de GPS
locar.on("gpsupdate", (pos, distMoved) => {
    if (firstLocation) {
        // ✨ Carregar apenas o modelo trozoba.glb na posição Oeste
        const loader = new GLTFLoader();
        loader.load(
            `${import.meta.env.BASE_URL}trozoba.glb`,
            function (gltf) {
                const model = gltf.scene;
                model.scale.set(80, 80, 80); // Aumentado significativamente o tamanho
                model.position.set(-10, -2, -15); // Posicionado mais próximo e centralizado

                // Apply black color
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black color
                    }
                });

                // Posicionar o modelo a oeste da posição atual
                trozobaModel = model; // Armazena o modelo na variável global
                locar.add(
                    trozobaModel,
                    pos.coords.longitude - 0.0005, // ~55m a oeste
                    pos.coords.latitude
                );
                console.log('Modelo trozoba.glb carregado a oeste da posição atual.');
            },
            undefined,
            function (error) {
                console.error('Erro ao carregar trozoba.glb:', error);
            }
        );
        
        firstLocation = false;
    }
});

locar.startGps();

renderer.setAnimationLoop(animate);

function animate() {
    deviceOrientationControls.update();
    
    // ✨ Rotação contínua do modelo trozoba.glb
    if (trozobaModel) {
        trozobaModel.rotation.y += 0.01; // Rotação mais rápida para ser mais visível
    }
    
    renderer.render(scene, camera);
}

// Audio playback logic
const backgroundAudio = document.getElementById('background-audio');
if (backgroundAudio) {
    backgroundAudio.src = `${import.meta.env.BASE_URL}trozoba.mp3`;
}

function tryPlayAudio() {
    if (backgroundAudio) {
        backgroundAudio.play()
            .then(() => {
                console.log('Audio playing automatically.');
            })
            .catch(error => {
                console.warn('Autoplay prevented:', error);
                // Show a message or button to the user to play audio
                document.addEventListener('click', userPlayAudio, { once: true });
                document.addEventListener('touchstart', userPlayAudio, { once: true });
            });
    }
}

function userPlayAudio() {
    if (backgroundAudio) {
        backgroundAudio.play()
            .then(() => {
                console.log('Audio playing after user interaction.');
            })
            .catch(error => {
                console.error('Error playing audio after user interaction:', error);
            });
    }
}

tryPlayAudio();
