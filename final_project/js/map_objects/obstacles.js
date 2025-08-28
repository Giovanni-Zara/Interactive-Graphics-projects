import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { createMaterial } from '../texture_loader.js';

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.objLoader = new OBJLoader();
        this.mtlLoader = new MTLLoader();
        this.crabModel = null; // Store loaded crab model for reuse
    }

    async init() {
        // Pre-load the crab model
        await this.loadCrabModel();
    }

    async loadCrabModel() {
        return new Promise((resolve, reject) => {
            // First load the MTL file
            this.mtlLoader.load(
                '../objects/crab/crab.mtl', // Path to the MTL file
                (materials) => {
                    materials.preload();
                    
                    // Apply materials to the OBJ loader
                    this.objLoader.setMaterials(materials);
                    
                    // Now load the OBJ file with materials
                    this.objLoader.load(
                        '../objects/crab/crab.obj',
                        (object) => {
                            // Configure the loaded model
                            object.traverse((child) => {
                                if (child.isMesh) {
                                    // Enable shadows
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                    
                                    // If material exists from MTL, keep it; otherwise use fallback
                                    if (!child.material) {
                                        child.material = new THREE.MeshLambertMaterial({ 
                                            color: 0xFF4500 // Orange-red crab color as fallback
                                        });
                                    }
                                }
                            });
                            
                            // Scale the model appropriately
                            object.scale.set(0.1, 0.1, 0.1);
                            
                            this.crabModel = object;
                            //this.debugCrabModel(object); // to understand the parts, comment for less spam
                            //console.log('Crab model loaded successfully with materials');
                            resolve(object);
                        },
                        (progress) => {
                            console.log('Loading crab OBJ:', (progress.loaded / progress.total * 100) + '%');
                        },
                        (error) => {
                            console.warn('Could not load crab OBJ file:', error);
                            reject(error);
                        }
                    );
                },
                (progress) => {
                    console.log('Loading crab MTL:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.warn('Could not load crab MTL file', error);
                    
                }
            );
        });
    }

    
    // DEBUG: Method to scan and log all parts of the crab model
   /* debugCrabModel(crabObject) {
        console.log('=== CRAB MODEL STRUCTURE ===');
       // console.log('Root object:', crabObject);
        //console.log('Children count:', crabObject.children.length);
        
        let meshCount = 0;
        
        crabObject.traverse((child, index) => {
            if (child.isMesh) {
                meshCount++;
                console.log(`--- Mesh ${meshCount} ---`);
                console.log('Name:', child.name || 'NO NAME');
                console.log('Type:', child.type);
                console.log('Position:', {
                    x: child.position.x.toFixed(3),
                    y: child.position.y.toFixed(3),
                    z: child.position.z.toFixed(3)
                });
                console.log('Scale:', {
                    x: child.scale.x.toFixed(3),
                    y: child.scale.y.toFixed(3),
                    z: child.scale.z.toFixed(3)
                });
                console.log('Geometry:', child.geometry.type);
                console.log('Material:', child.material ? child.material.type : 'NO MATERIAL');
                console.log('UUID:', child.uuid);
                console.log('---');
            } else if (child.isGroup || child.isObject3D) {
                console.log(`Group/Object3D: "${child.name || 'NO NAME'}" - Type: ${child.type}`);
            }
        });
        
        console.log(`Total meshes found: ${meshCount}`);
        console.log('=== END CRAB MODEL STRUCTURE ===');
    }*/
    

    createObstacles() {
        //this.createLogs();  
        this.createCrabs();
    }

    /*
    createLogs() {
        // Moving logs
        const logPositions = [
            { x: -20, z: 0, direction: 1 },
            { x: 0, z: -3, direction: -1 },
            { x: 20, z: 1, direction: 1 }
        ];
        
        logPositions.forEach(pos => {
            const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
            const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const log = new THREE.Mesh(logGeometry, logMaterial);
            
            log.position.set(pos.x, 1, pos.z);
            log.rotation.z = Math.PI / 2;
            log.castShadow = true;
            this.scene.add(log);
            
            this.obstacles.push({
                mesh: log,
                type: 'log',
                direction: pos.direction,
                speed: 0.02,
                originalX: pos.x,
                animationData: {}
            });
        });
    }*/

    createCrabs() {
        const crabPositions = [
            { x: -15, z: 5, direction: 1 },
            { x: 15, z: -4, direction: -1 },
            { x: -25, z: 2, direction: 1 },
            { x: 25, z: -6, direction: -1 }
        ];
        
        crabPositions.forEach((pos, index) => {
            if (this.crabModel) {
                // Clone the loaded crab model
                const crab = this.crabModel.clone();
                crab.position.set(pos.x, 0.5, pos.z);
                crab.castShadow = true;
                
                // Random initial rotation
                crab.rotation.y = Math.random() * Math.PI * 2;
                
                this.scene.add(crab);
                
                this.obstacles.push({
                    mesh: crab,
                    type: 'crab',
                    direction: pos.direction,
                    speed: 0.008 + Math.random() * 0.004, // Varied speed
                    originalZ: pos.z,
                    platformX: pos.x,
                    animationData: {
                        walkCycle: Math.random() * Math.PI * 2, // Random start phase
                        bobAmount: 0.1 + Math.random() * 0.05,  // Slight vertical bobbing
                        rotationSpeed: 0.02 + Math.random() * 0.01,
                        scuttleRange: 3 + Math.random() * 2 // How far they move
                    }
                });
            }
        });
    }

    updateObstacles(time) {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'crab') {
                this.updateCrab(obstacle, time);
            }/* else if (obstacle.type === 'log') {
                this.updateLog(obstacle);
            }*/
        });
    }

    /*
    updateLog(log) {
        // Simple back and forth movement for logs
        log.mesh.position.x += log.direction * log.speed;
        if (Math.abs(log.mesh.position.x - log.originalX) > 5) {
            log.direction *= -1;
        }
        
        // Add slight rotation
        log.mesh.rotation.x += 0.005;
    }*/

    updateCrab(crab, time) {
        const anim = crab.animationData;
        
        // Scuttling movement (side to side)
        crab.mesh.position.z += crab.direction * crab.speed;
        if (Math.abs(crab.mesh.position.z - crab.originalZ) > anim.scuttleRange) {
            crab.direction *= -1;
            // Face the new direction
            crab.mesh.rotation.y += Math.PI;
        }
        
        // Walking animation - vertical bobbing
        anim.walkCycle += 0.15;
        const bobOffset = Math.sin(anim.walkCycle) * anim.bobAmount;
        crab.mesh.position.y = 1 + bobOffset;
        
        // crab animation
        this.animateWholeCrab(crab.mesh, anim);
        

        
        // Random direction changes occasionally
        if (Math.random() < 0.001) {
            crab.direction *= -1;
            crab.mesh.rotation.y += Math.PI;
        }
    }
    animateWholeCrab(crabMesh, animData) {
        const time = animData.walkCycle;
        
        // Side-to-side scuttling motion 
        const scuttleMotion = Math.sin(time * 2) * 0.1;
        crabMesh.rotation.z = scuttleMotion;
        
        // Forward/backward motion
        const rockMotion = Math.sin(time * 1.5) * 0.08;
        crabMesh.rotation.x = rockMotion;
        
        // Slight lifting motion to simulate claw raising
        const liftMotion = Math.sin(time * 3) * 0.05;
        crabMesh.position.y += liftMotion;
        
        // Subtle turning motion for more life-like movement
        const turnMotion = Math.sin(time * 0.8) * 0.1;
        crabMesh.rotation.y += turnMotion * 0.01;
        
        // Scale animation to simulate breathing/pulsing
        const breatheScale = 1 + Math.sin(time * 4) * 0.02;
        crabMesh.scale.set(0.1 * breatheScale, 0.1 * breatheScale, 0.1 * breatheScale);
    }

    // Method to add custom obstacles
    addCustomObstacle(mesh, type, animationData = {}) {
        this.scene.add(mesh);
        this.obstacles.push({
            mesh: mesh,
            type: type,
            animationData: animationData
        });
    }

    // Remove all obstacles
    removeAllObstacles() {
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle.mesh);
        });
        this.obstacles = [];
    }

    // Get obstacles for collision detection
    getObstacles() {
        return this.obstacles;
    }

    // Get crab obstacles specifically
    getCrabs() {
        return this.obstacles.filter(obstacle => obstacle.type === 'crab');
    }

    // Get log obstacles specifically
   /* getLogs() {
        return this.obstacles.filter(obstacle => obstacle.type === 'log');
    }*/
}
