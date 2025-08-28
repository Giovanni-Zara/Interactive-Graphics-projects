import * as THREE from 'three';

export function loadTexture(texturePath, options = {}) {
    const {
        repeatX = 1, repeatY = 1, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping, onLoad = null, onError = null
    } = options;

    const textureLoader = new THREE.TextureLoader();
    
    return new Promise((resolve, reject) => {
        const texture = textureLoader.load(
            texturePath,
            (loadedTexture) => {
                // Configure texture
                loadedTexture.wrapS = wrapS;
                loadedTexture.wrapT = wrapT;
                loadedTexture.repeat.set(repeatX, repeatY);
                
                //console.log(`Texture loaded successfully: ${texturePath}`);
                if (onLoad) onLoad(loadedTexture);
                resolve(loadedTexture);
            },
            undefined,
            (error) => {
                //console.error(`Error loading texture: ${texturePath}`, error);
                if (onError) onError(error);
                reject(error);
            }
        );
    });
}

export function createMaterial(texturePath, fallbackColor = 0xCCCCCC, materialOptions = {}) {
    const {
        side = THREE.DoubleSide,
        repeatX = 1,
        repeatY = 1,
    } = materialOptions;

    if (texturePath) {
        return loadTexture(texturePath, { repeatX, repeatY })
            .then(texture => {
                return new THREE.MeshLambertMaterial({
                    map: texture,
                    side,
                });
            })
            .catch(() => {
                // Fallback to color material
                return new THREE.MeshLambertMaterial({
                    color: fallbackColor,
                    side,
                });
            });
    } else {
        // Return color material directly
        return Promise.resolve(new THREE.MeshLambertMaterial({
            color: fallbackColor,
            side,
        }));
    }
}