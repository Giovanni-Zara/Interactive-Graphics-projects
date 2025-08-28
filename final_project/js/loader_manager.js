import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class AssetManager {  
    constructor(loadingManager) {
        this.loadingManager = loadingManager;

        // Initialize loaders with the provided loading manager
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.objLoader = new OBJLoader(this.loadingManager);
        this.fbxLoader = new FBXLoader(this.loadingManager);
        
        // Create a separate FBX loader that doesn't use the LoadingManager
        // for the three model that has texture issues
        this.standaloneFBXLoader = new FBXLoader();
    }
    
    // Load texture with caching 
    // function called for the only two textures present in the game: bambu for RegularPlatform and for paved in CheckPoint
    loadTexture(url, onLoad, onProgress, onError) {
    
                
        const texture = this.textureLoader.load( //function of the THREE.TextureLoader
            url,
            (loadedTexture) => {
                // insert in the cache
                this.textureCache.set(url, loadedTexture);
                if (onLoad) onLoad(loadedTexture);
            },
            onProgress,
            (error) => {
                // Create a fallback texture for missing textures
                console.warn(`--> Texture not found: ${url}, in loadTexture of Assetmanager.js`);
            }
        );
        return texture;
    }
    
    // Load OBJ model --> called in the specific class that needs the model (es goalPlatform and Player)
    loadOBJ(url, onLoad, onProgress, onError) {
   
        
    
        this.objLoader.load( // function of the THREE.OBJLoader
            url,
            (object) => {
                // insert in the cache
                this.modelCache.set(url, object);
                // Apply shadow settings to newly loaded object
                if (window.game && window.game.gameState && window.game.gameState.getShadowManager()) {
                    window.game.gameState.getShadowManager().processLoadedObject(object);
                }
                if (onLoad) onLoad(object);
            },
            onProgress,
            onError
        );
    }

    // Load FBX model --> called in the specific class that needs the model
    loadFBX(url, onLoad, onProgress, onError) {
        
        // Use standalone loader for models known to have texture issues
        // the difference is that theCreate a separate FBX loader that doesn't use the LoadingManager
        const loaderToUse = url.includes('Japanese_Tree.fbx') ? this.standaloneFBXLoader : this.fbxLoader;
       
        loaderToUse.load(
            url,
            (object) => {
                this.modelCache.set(url, object);
                // Apply shadow settings to newly loaded object
                if (window.game && window.game.gameState && window.game.gameState.getShadowManager()) {
                    window.game.gameState.getShadowManager().processLoadedObject(object);
                }
                if (onLoad) onLoad(object);
            },
            onProgress,
            (error) => {
                //know error
                if (error.message && error.message.includes('Bark for tree.jpg')) {
                    console.warn('Warning: Bark for tree.jpg texture not found. Skipping texture application.');
                } 
                else if (onError) {
                    //other possible errors
                    onError(error);
                }
            }
        );
    }
}
