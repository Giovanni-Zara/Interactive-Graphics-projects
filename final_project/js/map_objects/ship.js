import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export class Ship {
    constructor(scene, position = { x: 50, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        this.shipGroup = null;
        this.objLoader = new OBJLoader();
        this.mtlLoader = new MTLLoader();
        this.loaded = false;
        this.animationTime = 0;
        
        // Ship properties for animation
        this.originalPosition = { ...position };
        this.bobAmplitude = 0.3; // How much the ship moves up/down
        this.bobSpeed = 1.2; // How fast the ship bobs
        this.rotateAmplitude = 0.05; // How much the ship tilts
        this.rotateSpeed = 0.8; // How fast the ship tilts
        
        // Platform bounds for collision detection
        this.platformBounds = null;
    }

    async init() {
        try {
            await this.loadShip();
            this.setupShipPlatform();
            console.log('Ship initialized successfully');
        } catch (error) {
            console.error('Error initializing ship:', error);
            // Create a fallback ship if loading fails
            this.createFallbackShip();
        }
    }

    async loadShip() {
        return new Promise((resolve, reject) => {
            // First try to load materials, but continue even if they fail
            this.mtlLoader.load(
                './objects/Loagn_Pirate_Ship_Textured.mtl',
                (materials) => {
                    //console.log('Ship materials loaded');
                    materials.preload();
                    this.objLoader.setMaterials(materials);
                    this.loadObjFile(resolve, reject);
                },
                (progress) => {
                    console.log('Materials loading progress:', progress);
                },
                (error) => {
                    console.warn('Could not load ship materials, using fallback:', error);
                    // Continue without materials
                    this.loadObjFile(resolve, reject);
                }
            );
        });
    }

    loadObjFile(resolve, reject) {
        this.objLoader.load(
            './objects/ship3.obj',
            (object) => {
                console.log('Ship OBJ loaded successfully');
                this.setupShipObject(object);
                resolve();
            },
            (progress) => {
                console.log('Ship loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading ship OBJ:', error);
                reject(error);
            }
        );
    }

    createFallbackShip() {
        console.log('Creating fallback ship geometry');
        
        // Create a simple ship using basic geometries
        this.shipGroup = new THREE.Group();
        
        // Hull
        const hullGeometry = new THREE.BoxGeometry(8, 2, 4);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1;
        hull.castShadow = true;
        hull.receiveShadow = true;
        this.shipGroup.add(hull);
        
        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 6;
        mast.castShadow = true;
        this.shipGroup.add(mast);
        
        // Sail
        const sailGeometry = new THREE.PlaneGeometry(5, 7);
        const sailMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(1.5, 6, 0);
        sail.castShadow = true;
        this.shipGroup.add(sail);
        
        // Position the ship group
        this.shipGroup.position.set(this.position.x, this.position.y, this.position.z);
        
        // Add to scene
        this.scene.add(this.shipGroup);
        
        this.loaded = true;
        this.setupShipPlatform();
    }

    setupShipObject(object) {
        // Create a group to hold the ship
        this.shipGroup = new THREE.Group();
        
        // Process the loaded OBJ
        object.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Set up material if textures aren't loaded properly
                if (!child.material || child.material.map === null) {
                    // Create a nice brown material for the ship
                    child.material = new THREE.MeshLambertMaterial({ 
                        color: 0x8B4513, // Brown wood color
                        side: THREE.DoubleSide
                    });
                } else if (child.material) {
                    // Ensure existing materials work with lighting
                    child.material.side = THREE.DoubleSide;
                    if (child.material.transparent === undefined) {
                        child.material.transparent = false;
                    }
                }
            }
        });

        // Scale 
        object.scale.set(3, 3, 3);
        
        // Add the ship object to the group
        this.shipGroup.add(object);
        
        // Position the ship group
        this.shipGroup.position.set(this.position.x, this.position.y, this.position.z);
        
        // Add to scene
        this.scene.add(this.shipGroup);
        
        this.loaded = true;
    }

    setupShipPlatform() {
        if (!this.shipGroup) return;

        // Create platform bounds for collision detection
        // Adjust these values based on your ship model's actual dimensions
        const shipBounds = new THREE.Box3().setFromObject(this.shipGroup);
        const size = shipBounds.getSize(new THREE.Vector3());
        
        // Make the walkable area slightly smaller than the ship bounds
        // and position it at deck level
        this.platformBounds = {
            minX: this.position.x - size.x * 0.3,
            maxX: this.position.x + size.x * 0.3,
            minZ: this.position.z - size.z * 0.3,
            maxZ: this.position.z + size.z * 0.3,
            y: this.position.y + size.y * 0.4 // Deck height
        };

        //console.log('Ship platform bounds:', this.platformBounds);
        //console.log('Ship size:', size);
    }

    updateShip(time) {
        if (!this.loaded || !this.shipGroup) return;
        
        this.animationTime = time;
        
        // Animate ship bobbing (floating on water)
        const bobOffset = Math.sin(time * this.bobSpeed) * this.bobAmplitude;
        this.shipGroup.position.y = this.originalPosition.y + bobOffset;
        
        // Animate ship tilting (rocking motion)
        const tiltX = Math.sin(time * this.rotateSpeed) * this.rotateAmplitude;
        const tiltZ = Math.cos(time * this.rotateSpeed * 0.7) * this.rotateAmplitude * 0.5;
        
        this.shipGroup.rotation.x = tiltX;
        this.shipGroup.rotation.z = tiltZ;
        
        // Update platform bounds Y position to match ship movement
        if (this.platformBounds) {
            this.platformBounds.y = this.originalPosition.y + bobOffset + 1; // Deck height
        }
    }

    // Get ship group for external access
    getShipGroup() {
        return this.shipGroup;
    }

    // Get ship position for distance calculations
    getPosition() {
        return this.shipGroup ? this.shipGroup.position : new THREE.Vector3(this.originalPosition.x, this.originalPosition.y, this.originalPosition.z);
    }

    // Get platform bounds for collision system
    getPlatformBounds() {
        return this.platformBounds;
    }

    // Check if player is on the ship (for win condition)
    isPlayerOnShip(playerPosition, tolerance = 3) {
        if (!this.platformBounds) {
            //console.log('No platform bounds for ship');
            return false;
        }
        
        const isOnShip = (
            playerPosition.x >= this.platformBounds.minX - tolerance &&
            playerPosition.x <= this.platformBounds.maxX + tolerance &&
            playerPosition.z >= this.platformBounds.minZ - tolerance &&
            playerPosition.z <= this.platformBounds.maxZ + tolerance &&
            playerPosition.y >= this.platformBounds.y - tolerance &&
            playerPosition.y <= this.platformBounds.y + tolerance * 2
        );
        
        
        
        return isOnShip;
    }

    // Get ship bounds for advanced collision detection
    getShipBounds() {
        if (!this.shipGroup) return null;
        
        const bounds = new THREE.Box3().setFromObject(this.shipGroup);
        return bounds;
    }
}