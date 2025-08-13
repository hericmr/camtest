# 🎭 AR Trozoba - Realidade Aumentada

Uma experiência completa de Realidade Aumentada (AR) que integra câmera, renderização 3D e sensores do dispositivo para criar uma experiência imersiva similar ao Pokémon GO.

## 🚀 Funcionalidades

### ✅ **Acesso Automático à Câmera**
- Solicitação automática de permissão da câmera ao acessar o site
- Configuração otimizada para dispositivos móveis
- Suporte a câmera frontal e traseira
- Qualidade de vídeo configurável (1280x720 ideal)

### ✅ **Carregamento Automático do Modelo 3D**
- Modelo `trozoba.glb` carregado automaticamente após permissão da câmera
- Sem necessidade de interação adicional (botões ou cliques)
- Posicionamento e escala pré-definidos para simular presença física

### ✅ **Posicionamento Fixo do Modelo**
- Modelo ancorado em posição e escala específicas
- Simula presença física no ambiente real
- Experiência similar ao AR do Pokémon GO

### ✅ **Integração com Sensores do Dispositivo**
- **Giroscópio**: Rotação do modelo baseada na orientação do dispositivo
- **Acelerômetro**: Movimento sutil baseado na aceleração
- **Bússola**: Rotação horizontal baseada na direção
- **Calibração automática** dos sensores para precisão

### ✅ **Tecnologias Utilizadas**
- **React 19** com hooks modernos
- **Three.js** para renderização 3D
- **WebGL** para aceleração de hardware
- **DeviceOrientation API** para sensores
- **MediaDevices API** para câmera
- **PWA** com manifest otimizado

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- NPM ou Yarn
- Navegador moderno com suporte a WebGL
- Dispositivo com câmera e sensores (recomendado)

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd ar-examples

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm start

# Ou construa para produção
npm run build
```

### Deploy
```bash
# Deploy para GitHub Pages
npm run deploy
```

## 📱 Como Usar

### **Experiência Automática**
1. **Acesse o site** em um dispositivo móvel
2. **Permita acesso à câmera** quando solicitado
3. **Permita acesso aos sensores** se solicitado (iOS)
4. **O modelo 3D será carregado automaticamente**
5. **Mova o dispositivo** para ver diferentes perspectivas

### **Controles Disponíveis**
- **🔄 Recarregar Modelo**: Recarrega o modelo 3D
- **🔄 Trocar Câmera**: Alterna entre câmera frontal e traseira
- **🔧 Recalibrar Sensores**: Recalibra os sensores para melhor precisão

## 🔧 Configuração

### **Configurações Globais** (`public/ar-config.js`)
```javascript
window.AR_CONFIG = {
  // Configurações da câmera
  camera: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment'
  },
  
  // Configurações do modelo 3D
  model: {
    scale: 2.5,
    position: { x: 0, y: -1, z: -3 },
    autoLoad: true
  },
  
  // Configurações dos sensores
  sensors: {
    sensitivity: 0.5,
    updateRate: 60
  }
};
```

### **Personalização**
- **Escala do modelo**: Ajuste `model.scale`
- **Posição**: Modifique `model.position`
- **Sensibilidade**: Ajuste `sensors.sensitivity`
- **Taxa de atualização**: Configure `sensors.updateRate`

## 🌐 Compatibilidade

### **Navegadores Suportados**
- ✅ Chrome 67+
- ✅ Firefox 55+
- ✅ Safari 11.1+
- ✅ Edge 79+

### **Dispositivos**
- ✅ **Android**: Chrome, Firefox, Samsung Internet
- ✅ **iOS**: Safari 11.1+
- ✅ **Desktop**: Chrome, Firefox, Edge (com câmera)

### **Recursos Necessários**
- ✅ WebGL 2.0
- ✅ MediaDevices API
- ✅ DeviceOrientation API (opcional)
- ✅ HTTPS (requerido para câmera)

## 📊 Performance

### **Otimizações Implementadas**
- **Frame Rate Limitado**: Máximo de 60 FPS configurável
- **Taxa de Atualização de Sensores**: Configurável (padrão: 60Hz)
- **WebGL Renderer Otimizado**: Alpha blending e antialiasing
- **Cleanup Automático**: Recursos liberados adequadamente

### **Métricas Recomendadas**
- **Dispositivos de Baixo Desempenho**: 30 FPS, 30Hz sensores
- **Dispositivos Médios**: 45 FPS, 45Hz sensores  
- **Dispositivos de Alto Desempenho**: 60 FPS, 60Hz sensores

## 🔒 Segurança e Privacidade

### **Permissões Solicitadas**
- **Câmera**: Para captura de vídeo em tempo real
- **Sensores**: Para orientação e movimento do dispositivo
- **Localização**: Não solicitada (não implementada)

### **Dados Coletados**
- ❌ **Nenhum dado pessoal** é coletado
- ❌ **Nenhum vídeo** é transmitido ou armazenado
- ❌ **Nenhum sensor** envia dados para servidores
- ✅ **Tudo processado localmente** no dispositivo

## 🐛 Solução de Problemas

### **Câmera não funciona**
- Verifique se o site está em HTTPS
- Confirme permissões do navegador
- Teste em modo incógnito

### **Sensores não respondem**
- **iOS**: Confirme permissão dos sensores
- **Android**: Verifique se os sensores estão habilitados
- **Desktop**: Sensores podem não estar disponíveis

### **Modelo 3D não aparece**
- Verifique se o arquivo `trozoba.glb` está na pasta `public`
- Confirme suporte a WebGL no navegador
- Verifique console para erros de carregamento

### **Performance baixa**
- Reduza `sensors.updateRate` no config
- Reduza `rendering.antialias` para `false`
- Use dispositivo com melhor hardware

## 🚧 Desenvolvimento

### **Estrutura do Projeto**
```
src/
├── components/
│   ├── AdvancedARScene.js    # Componente principal AR
│   ├── RealARScene.js        # Componente AR anterior
│   └── ARScene.js           # Componente AR básico
├── App.js                    # Aplicação principal
└── App.css                   # Estilos otimizados

public/
├── trozoba.glb              # Modelo 3D
├── ar-config.js             # Configurações AR
└── manifest.json            # PWA manifest
```

### **Extensões Possíveis**
- **Tracking de Marcadores**: AR.js para marcadores visuais
- **WebXR**: Suporte nativo a AR/VR
- **Múltiplos Modelos**: Sistema de spawn de objetos
- **Interação Touch**: Gestos e toques no modelo
- **Filtros de Câmera**: Efeitos visuais em tempo real

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação
- Verifique os logs do console

---

**🎭 AR Trozoba** - Transformando a realidade com tecnologia AR moderna!
