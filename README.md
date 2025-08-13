# 🚀 AR Examples - Projeto de Realidade Aumentada

Este projeto demonstra como criar experiências de Realidade Aumentada (AR) usando React, Three.js e tecnologias web modernas.

## ✨ Funcionalidades

### 🎯 Modo Demo 3D
- Visualização de objetos 3D estáticos
- Cubo vermelho e esfera verde rotacionando
- Botão para adicionar novos objetos (cones azuis)
- Alternância entre modo AR e visualização 3D pura

### 📱 Modo AR Real
- Acesso à câmera do dispositivo móvel
- Objetos 3D sobrepostos ao vídeo da câmera
- Múltiplos tipos de objetos (cubo, esfera, cone)
- Controles para adicionar/remover objetos
- Alternância de visibilidade dos objetos 3D

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework de interface
- **Three.js** - Biblioteca 3D para WebGL
- **WebRTC** - Acesso à câmera do dispositivo
- **CSS3** - Estilização e layout responsivo

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- Navegador moderno com suporte a WebGL
- Dispositivo móvel para melhor experiência AR

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd ar-examples

# Instale as dependências
npm install

# Execute o projeto
npm start
```

### Acesso
- Abra `http://localhost:3000` no navegador
- Para melhor experiência AR, use um dispositivo móvel
- Permita o acesso à câmera quando solicitado

## 📱 Como Usar

### Modo Demo 3D
1. Selecione "🎯 Demo 3D" no seletor de modo
2. Visualize os objetos 3D pré-carregados
3. Use "➕ Adicionar Cone" para criar novos objetos
4. Use "🔄 Alternar Modo" para mudar a visualização

### Modo AR Real
1. Selecione "📱 AR Real" no seletor de modo
2. Clique em "🎥 Ativar Câmera"
3. Permita o acesso à câmera do dispositivo
4. Use os botões para adicionar diferentes objetos 3D:
   - ➕ Cubo (vermelho)
   - ➕ Esfera (verde)
   - ➕ Cone (azul)
5. Use "👁️ Alternar Objetos" para mostrar/ocultar os objetos
6. Use "🗑️ Limpar" para remover todos os objetos

## 🔧 Estrutura do Projeto

```
ar-examples/
├── src/
│   ├── components/
│   │   ├── ARScene.js          # Modo demo 3D
│   │   └── RealARScene.js      # Modo AR real com câmera
│   ├── App.js                  # Componente principal com seletor
│   ├── App.css                 # Estilos da aplicação
│   └── index.js                # Ponto de entrada
├── public/                     # Arquivos estáticos
└── package.json                # Dependências e scripts
```

## 🌟 Recursos Técnicos

### Three.js Scene
- Cena 3D com iluminação ambiente e direcional
- Objetos geométricos básicos (cubo, esfera, cone)
- Sistema de rotação automática dos objetos
- Renderização responsiva com redimensionamento

### WebRTC Camera
- Acesso à câmera traseira do dispositivo
- Configuração de resolução ideal (1280x720)
- Tratamento de erros de permissão
- Controle de stream de vídeo

### Interface Responsiva
- Controles sobrepostos à cena AR
- Design adaptativo para diferentes tamanhos de tela
- Feedback visual do status da câmera
- Contadores e indicadores de estado

## 🎨 Personalização

### Adicionar Novos Objetos 3D
```javascript
// No componente RealARScene.js
const addCustomObject = () => {
  const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const torus = new THREE.Mesh(geometry, material);
  // ... posicionamento e adição à cena
};
```

### Modificar Materiais
```javascript
// Materiais com texturas ou cores personalizadas
const material = new THREE.MeshPhongMaterial({ 
  color: 0x00ff00,
  shininess: 100,
  transparent: true,
  opacity: 0.8
});
```

## 🔒 Considerações de Segurança

- O projeto solicita permissão de câmera apenas quando necessário
- Não há coleta ou transmissão de dados de vídeo
- Todas as operações são realizadas localmente no dispositivo

## 🌐 Compatibilidade

### Navegadores Suportados
- Chrome 67+ (Android)
- Safari 11+ (iOS)
- Firefox 55+ (Android)
- Edge 79+ (Windows)

### Dispositivos
- Smartphones Android e iOS
- Tablets com câmera
- Computadores com webcam (modo demo)

## 🚧 Limitações Atuais

- Detecção de movimento limitada
- Sem tracking de objetos reais
- Objetos 3D em posições fixas na tela
- Dependência de permissões de câmera

## 🔮 Próximos Passos

- [ ] Implementar AR.js para tracking de marcadores
- [ ] Adicionar detecção de gestos
- [ ] Suporte a modelos 3D personalizados (GLTF)
- [ ] Sistema de partículas e efeitos visuais
- [ ] Integração com sensores do dispositivo (giroscópio, acelerômetro)

## 📚 Recursos Adicionais

- [Three.js Documentation](https://threejs.org/docs/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [AR.js Framework](https://ar-js-org.github.io/AR.js/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando React, Three.js e tecnologias web modernas**
# camtest
