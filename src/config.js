// Configurações de localização para AR.js
export const LOCATION_CONFIG = {
    // Localização do usuário (São Paulo, Brasil)
    userLocation: {
        latitude: -46.31637363516056,
        longitude: -23.97882477971589,
        description: "São Paulo, Brasil"
    },
    
    // Localização do objeto AR (posição diferente do usuário)
    objectLocation: {
        latitude: -46.31664859550511,
        longitude: -23.978687342536734,
        description: "Caixa vermelha a aproximadamente 30m de distância"
    },
    
    // Configurações do objeto AR
    arObject: {
        geometry: {
            type: 'box',
            width: 2,
            height: 2,
            depth: 2
        },
        material: {
            color: 'red'
        },
        position: {
            x: 0,
            y: 0,
            z: -10
        }
    },
    
    // Configurações da câmera
    camera: {
        fov: 60,
        near: 0.001,
        far: 100
    }
};

// Função para formatar coordenadas para exibição
export const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// Função para obter a localização formatada do usuário
export const getUserLocationFormatted = () => {
    return formatCoordinates(
        LOCATION_CONFIG.userLocation.latitude,
        LOCATION_CONFIG.userLocation.longitude
    );
};

// Função para obter a localização formatada do objeto
export const getObjectLocationFormatted = () => {
    return formatCoordinates(
        LOCATION_CONFIG.objectLocation.latitude,
        LOCATION_CONFIG.objectLocation.longitude
    );
};
