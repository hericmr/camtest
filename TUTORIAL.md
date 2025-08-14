# AR.js baseado em Localização com LocAR.js
## Parte 1 - Hello World!

### 🎯 Introdução

Bem-vindo à primeira parte desta série de tutoriais sobre **LocAR.js**! Neste tutorial, você criará sua primeira aplicação de Realidade Aumentada baseada em localização - um clássico "Hello World" que exibe um cubo vermelho em uma posição geográfica específica.

**O que você aprenderá:**
- Configuração básica do LocAR.js com Three.js
- Como criar objetos AR posicionados geograficamente  
- Implementação de localização GPS simulada
- Configuração de webcam para visualização AR
- Controles básicos de mouse para desktop

---

### 📋 Pré-requisitos

Antes de começar, certifique-se de que você possui:

- **Conhecimento básico de Three.js:**
  - Conceitos de Scene, Camera e Renderer
  - Geometrias, Materiais e Meshes
  - Loop de animação básico

- **Ambiente de desenvolvimento:**
  - Node.js instalado
  - LocAR.js instalado via `npm install locar`
  - Vite configurado para desenvolvimento
  - Navegador moderno com suporte a WebGL

**💡 Dica:** Se você não está familiarizado com Three.js, recomenda-se estudar o [manual oficial do Three.js](https://threejs.org/docs/) antes de continuar.

---

### 🏗️ Estrutura do Projeto

Vamos começar criando a estrutura básica do projeto:

```
meu-projeto-ar/
├── src/
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

---

### 📄 HTML Base

Começamos com um HTML minimalista que servirá como container para nossa aplicação AR:

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LocAR.js - Hello World</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        
        /* Estilo opcional para loading */
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            z-index: 100;
        }
    </style>
    <script type='module' src='src/main.js'></script>
</head>
<body>
    <div class="loading" id="loading">
        Iniciando AR...
    </div>
</body>
</html>
```

**Pontos importantes:**
- **`type='module'`**: Permite usar imports ES6
- **Viewport meta tag**: Essencial para dispositivos móveis
- **Overflow hidden**: Remove barras de rolagem indesejadas
- **Loading indicator**: Feedback visual durante inicialização

---

### 🚀 Código JavaScript Principal

Agora vamos criar o arquivo `src/main.js` com nossa implementação completa:

```javascript
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
```

---

### 🔍 Análise Detalhada do Código

#### **1. Configuração Three.js Padrão**

```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 100);
const renderer = new THREE.WebGLRenderer();
```

**Por que esses valores?**
- **FOV 60°**: Bom equilíbrio entre realismo e campo de visão
- **Near plane 0.001**: Permite objetos muito próximos (importante para AR)
- **Far plane 100**: Alcance de 100 metros (adequado para AR local)

#### **2. Objetos LocAR.js Principais**

```javascript
const locationManager = new LocAR.LocationBased(scene, camera);
const webcam = new LocAR.Webcam({...});
```

**`LocAR.LocationBased`:**
- Gerencia posicionamento geográfico dos objetos
- Conecta coordenadas GPS ao sistema de coordenadas 3D
- Atualiza automaticamente posições baseadas em localização

**`LocAR.Webcam`:**
- Inicializa acesso à câmera do dispositivo
- Cria textura de vídeo para fundo da cena
- Gerencia permissões e configurações de vídeo

#### **3. Sistema de Coordenadas GPS**

```javascript
locationManager.fakeGps(-0.72, 51.05);           // Posição do usuário
locationManager.add(redCube, -0.72, 51.0501);    // Posição do objeto
```

**Como funciona:**
- Coordenadas em graus decimais (latitude/longitude)
- Diferença de 0.0001° ≈ 11 metros na latitude
- Sistema Mercator Esférico converte GPS para coordenadas 3D

---

### 🖱️ Controles de Mouse para Desktop

Para testar em desktop sem sensores de orientação, adicione este código antes da função `animate()`:

```javascript
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
```

---

### 🧪 Testando a Aplicação

#### **1. Executar o Projeto**

```bash
# No terminal, na pasta do projeto
npm run dev
```

#### **2. Comportamento Esperado**

**Em Desktop:**
- Feed da webcam aparece como fundo
- Cubo vermelho visível ao "olhar para o norte" 
- Clique e arraste para rotacionar a visualização
- Cubo permanece na mesma posição geográfica

**Em Dispositivo Móvel:**
- Feed da webcam em tela cheia
- Cubo aparece na direção norte (orientação fixa)
- Ainda não responde a movimentos do dispositivo (isso virá na Parte 2)

#### **3. Solução de Problemas**

**Webcam não funciona:**
- Verifique permissões do navegador
- Use HTTPS em produção
- Teste em navegador compatível

**Cubo não aparece:**
- Verifique console para erros
- Confirme que está "olhando para o norte"
- Ajuste distância do objeto (use valores menores)

**Performance baixa:**
- Reduza resolução da webcam
- Verifique compatibilidade WebGL
- Teste em navegador diferente

---

### 📱 Versão com Elemento de Vídeo Personalizado

Se você quiser maior controle sobre o elemento de vídeo, pode criar um elemento HTML customizado:

```html
<!-- Adicione ao HTML -->
<video id="arVideo" style="display: none;"></video>
```

```javascript
// Modifique a configuração da webcam
const webcam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: (videoTexture) => {
        scene.background = videoTexture;
        document.getElementById('loading').style.display = 'none';
    }
}, '#arVideo'); // Passa o seletor CSS do elemento vídeo
```

---

### 🎯 Conceitos-Chave Aprendidos

1. **Integração Three.js + LocAR.js**: Como combinar renderização 3D com posicionamento geográfico

2. **GPS Simulado**: Uso de `fakeGps()` para desenvolvimento e testes

3. **Posicionamento Geográfico**: Como `add()` converte coordenadas GPS em posições 3D

4. **Webcam Integration**: Configuração de feed de vídeo como fundo da cena AR

5. **Controles de Desktop**: Implementação de rotação manual para testes

---

### 🚀 Próximos Passos

**Na Parte 2, você aprenderá:**
- ✅ Substituir GPS simulado por GPS real
- ✅ Implementar controles de orientação do dispositivo
- ✅ Testar compatibilidade entre navegadores
- ✅ Sistema de calibração com múltiplos objetos

**Desafios para praticar:**
1. **Múltiplos Objetos**: Adicione cubos de diferentes cores em posições variadas
2. **Animação**: Faça os cubos rotacionarem ou mudarem de cor
3. **Interação**: Adicione cliques/toques para interagir com objetos
4. **UI**: Crie interface para inserir coordenadas personalizadas

---

### 📚 Recursos Adicionais

- 📖 [Documentação Three.js](https://threejs.org/docs/)
- 🔗 [Repositório LocAR.js](https://github.com/nickw1/locar)
- 🌍 [Conversor de Coordenadas GPS](https://www.latlong.net/)
- 🛠️ [Vite.js Documentation](https://vitejs.dev/)
- 📱 [WebRTC API (para webcam)](https://developer.mozilla.org/docs/Web/API/WebRTC_API)

---

### ✅ Checklist de Conclusão

Antes de prosseguir para a Parte 2, certifique-se de que:

- [ ] Aplicação roda sem erros no console
- [ ] Webcam é inicializada corretamente  
- [ ] Cubo vermelho aparece na visualização
- [ ] Controles de mouse funcionam (desktop)
- [ ] Redimensionamento de janela funciona
- [ ] Compreende o sistema de coordenadas GPS
- [ ] Entende a estrutura básica do LocAR.js

**🎉 Parabéns!** Você criou sua primeira aplicação AR com LocAR.js. Agora está pronto para evoluir para GPS real e controles de orientação na Parte 2!
