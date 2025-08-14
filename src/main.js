import * as THREE from 'three';

// Configuração básica do Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 100);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('glscene') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Sistema de localização personalizado
class LocationBasedAR {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.userLocation = { lat: 0, lon: 0 };
        this.objects = [];
        this.webcamTexture = null;
        this.webcamVideo = null;
        this.initWebcam();
    }

    initWebcam() {
        // Cria elemento de vídeo para webcam
        this.webcamVideo = document.createElement('video');
        this.webcamVideo.style.display = 'none';
        document.body.appendChild(this.webcamVideo);

        // Solicita acesso à câmera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.webcamVideo.srcObject = stream;
                this.webcamVideo.play();
                
                // Cria textura da webcam
                this.webcamTexture = new THREE.VideoTexture(this.webcamVideo);
                this.webcamTexture.minFilter = THREE.LinearFilter;
                this.webcamTexture.magFilter = THREE.LinearFilter;
                
                // Cria plano de fundo com a webcam
                const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
                const backgroundMaterial = new THREE.MeshBasicMaterial({ 
                    map: this.webcamTexture,
                    side: THREE.DoubleSide
                });
                const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
                background.position.z = -1;
                this.scene.add(background);
                
                console.log('✅ Webcam inicializada com sucesso');
            })
            .catch(error => {
                console.warn('⚠️ Webcam não disponível:', error);
                // Cria plano de fundo preto se não houver webcam
                const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
                const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
                background.position.z = -1;
                this.scene.add(background);
            });
    }

    fakeGps(lon, lat) {
        this.userLocation = { lon, lat };
        console.log(`📍 Localização fake definida: ${lat}, ${lon}`);
    }

    add(object, lat, lon) {
        // Converte coordenadas GPS para posição 3D
        const position = this.gpsTo3D(lat, lon);
        object.position.copy(position);
        
        this.scene.add(object);
        this.objects.push({ object, lat, lon, position });
        
        console.log(`🎯 Objeto adicionado em: ${lat}, ${lon}`);
        return object;
    }

    gpsTo3D(lat, lon) {
        // Conversão simples de GPS para coordenadas 3D
        // Em uma implementação real, isso seria mais complexo
        const latDiff = lat - this.userLocation.lat;
        const lonDiff = lon - this.userLocation.lon;
        
        // Converte diferenças de coordenadas para metros (aproximação)
        const x = lonDiff * 111320 * Math.cos(this.userLocation.lat * Math.PI / 180);
        const z = -latDiff * 111320; // Negativo para Z (norte = Z negativo)
        
        return new THREE.Vector3(x, 0, z);
    }

    update() {
        // Atualiza textura da webcam se disponível
        if (this.webcamTexture) {
            this.webcamTexture.needsUpdate = true;
        }
    }
}

// Criação da instância de AR
const ar = new LocationBasedAR(scene, camera);

// Criação da caixa vermelha
const box = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0xff0000 }));

// Coordenadas padrão (São Paulo, Brasil)
const defaultLat = -23.97882477971589;
const defaultLon = -46.31637363516056;

// Posiciona o usuário em uma localização fake
ar.fakeGps(defaultLon, defaultLat);

// Adiciona a caixa a uma localização específica (30m de distância)
ar.add(cube, -23.978687342536734, -46.31664859550511);

// Configuração dos inputs de GPS fake
const fakeLatInput = document.getElementById('fakeLat');
const fakeLonInput = document.getElementById('fakeLon');
const setFakeLocButton = document.getElementById('setFakeLoc');

// Preenche os inputs com as coordenadas padrão
fakeLatInput.value = defaultLat;
fakeLonInput.value = defaultLon;

// Evento para definir nova localização fake
setFakeLocButton.addEventListener('click', () => {
    const newLat = parseFloat(fakeLatInput.value);
    const newLon = parseFloat(fakeLonInput.value);
    
    if (!isNaN(newLat) && !isNaN(newLon)) {
        // Atualiza a localização fake
        ar.fakeGps(newLon, newLat);
        
        // Reposiciona todos os objetos
        ar.objects.forEach(({ object, lat, lon }) => {
            const newPosition = ar.gpsTo3D(lat, lon);
            object.position.copy(newPosition);
        });
        
        console.log(`Nova localização fake definida: ${newLat}, ${newLon}`);
    } else {
        alert('Por favor, insira coordenadas válidas!');
    }
});

// Controles de mouse para desktop (simulação de rotação)
const rotationStep = THREE.MathUtils.degToRad(2);
let mousedown = false, lastX = 0;

window.addEventListener("mousedown", e => {
    mousedown = true;
});

window.addEventListener("mouseup", e => {
    mousedown = false;
});

window.addEventListener("mousemove", e => {
    if (!mousedown) return;
    
    if (e.clientX < lastX) {
        camera.rotation.y -= rotationStep;
        if (camera.rotation.y < 0) {
            camera.rotation.y += 2 * Math.PI;
        }
    } else if (e.clientX > lastX) {
        camera.rotation.y += rotationStep;
        if (camera.rotation.y > 2 * Math.PI) {
            camera.rotation.y -= 2 * Math.PI;
        }
    }
    lastX = e.clientX;
});

// Redimensionamento da janela
window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;    
    camera.updateProjectionMatrix();
});

// Loop de animação
function animate() {
    ar.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Inicia o loop de animação
animate();

console.log('🎉 LocAR.js Hello World carregado com sucesso!');
console.log(`📍 Localização padrão: ${defaultLat}, ${defaultLon}`);
console.log(`🎲 Caixa vermelha posicionada em: -23.978687, -46.316649`);
