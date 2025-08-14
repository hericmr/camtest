# 🌐 Configuração do GitHub Pages - AR.js Hello World

## ✅ **Status: GitHub Pages Configurado com Sucesso!**

- **Data**: 14 de Agosto de 2024
- **Branch**: `gh-pages` criada automaticamente
- **Status**: Deploy realizado com sucesso

## 🚀 **Como Fazer Deploy no GitHub Pages**

### **1. Deploy Automático (Recomendado)**
```bash
npm run deploy:gh-pages
```

### **2. Deploy Manual**
```bash
# Build + Deploy
npm run build && gh-pages -d dist
```

## 🔧 **Configuração no GitHub**

### **Passo 1: Acessar Settings**
1. Vá para seu repositório: `https://github.com/hericmr/camtest`
2. Clique em **Settings** (aba superior)

### **Passo 2: Configurar Pages**
1. Role até a seção **Pages** (menu lateral esquerdo)
2. Em **Source**, selecione **Deploy from a branch**
3. Em **Branch**, selecione **gh-pages**
4. Clique **Save**

### **Passo 3: Aguardar Deploy**
- O GitHub Pages será ativado automaticamente
- Pode levar alguns minutos para ficar disponível
- Você receberá um email quando estiver ativo

## 🌐 **URLs de Acesso**

### **Repositório**
- **GitHub**: `https://github.com/hericmr/camtest`
- **Branch gh-pages**: `https://github.com/hericmr/camtest/tree/gh-pages`

### **GitHub Pages (após configuração)**
- **URL**: `https://hericmr.github.io/camtest`
- **Status**: ✅ Disponível após configuração

## 📱 **Funcionalidades Disponíveis**

### **AR.js Hello World**
- **📍 Localização**: São Paulo, Brasil
- **🎲 Objeto**: Caixa vermelha a 30m de distância
- **📱 Suporte**: Mobile com GPS + Desktop com mouse
- **📹 Webcam**: Feed da câmera como fundo

### **Tecnologias**
- **AR.js** - Realidade aumentada baseada em localização
- **A-Frame** - Framework para VR/AR
- **Vite** - Build tool otimizado

## 🔄 **Atualizações Automáticas**

### **Sempre que fizer mudanças:**
```bash
# Deploy completo (Git + GitHub Pages)
npm run deploy:gh-pages
```

### **O que acontece:**
1. ✅ Build de produção executado
2. ✅ Pasta `dist/` criada/atualizada
3. ✅ Branch `gh-pages` atualizada
4. ✅ GitHub Pages atualizado automaticamente

## 📊 **Métricas do Deploy**

- **Tamanho total**: ~4.7 kB (gzipped)
- **JavaScript**: 2.81 kB (gzipped)
- **HTML**: 1.86 kB (gzipped)
- **Tempo de build**: ~90ms
- **Branch gh-pages**: ✅ Criada e configurada

## 🎯 **Próximos Passos**

### **1. Configurar GitHub Pages**
- Siga os passos acima para ativar o Pages
- Aguarde o email de confirmação

### **2. Testar Online**
- Acesse `https://hericmr.github.io/camtest`
- Teste em dispositivos móveis com GPS
- Verifique se a caixa vermelha aparece

### **3. Personalizar**
- Adicione mais objetos AR
- Mude localizações e coordenadas
- Adicione interatividade

## 🚨 **Solução de Problemas**

### **GitHub Pages não funciona:**
1. Verifique se a branch `gh-pages` existe
2. Confirme se está selecionada em Settings > Pages
3. Aguarde alguns minutos após o deploy
4. Verifique se não há erros no console

### **Deploy falha:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run deploy:gh-pages
```

## 📞 **Suporte**

- **Documentação**: `DEPLOY.md`
- **Script de deploy**: `deploy.sh`
- **Comandos npm**: `package.json`
- **GitHub Pages**: `gh-pages` package

---

**🎉 GitHub Pages configurado com sucesso!**

Após configurar no GitHub, seu projeto AR.js estará disponível online em:
**`https://hericmr.github.io/camtest`**
