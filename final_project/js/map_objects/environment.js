// Environment Manager - Handles world creation and management
import * as THREE from 'three';
import { Beach } from './beach.js';
import { Forest } from './forest.js';
import { Obstacles } from './obstacles.js';
import { Ship } from './ship.js';
import { createMaterial } from '../texture_loader.js';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.beach = null;
        this.forest = null;
        this.ship = null;
        this.obstaclesManager = null;
        this.platforms = [];
        this.WATER_LEVEL = -1; // Sea level height
    }

    async createWorld() {
        this.createSky();
        this.createSea();
        this.createBeach();
        this.createForest();
        await this.createPlatforms();
        await this.initializeObstacles();
        await this.createShip();
        this.createLighting();
    }

    createSky() {
        // gradient sky using SphereGeometry
        const skyGeometry = new THREE.SphereGeometry(500, 32, 15);
        
        // Create gradient material
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },    // Sky blue
                bottomColor: { value: new THREE.Color(0xffffff) }, // White horizon
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
    }
    
    createSea() {
        const seaGeometry = new THREE.PlaneGeometry(200, 200, 100, 100); // (width, height, widthSegment, heightSegment) segments for waves
        const seaMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x006994,
            transparent: true,
            opacity: 0.7,
            flatShading: true
        });
        
        this.sea = new THREE.Mesh(seaGeometry, seaMaterial);
        this.sea.rotation.x = -Math.PI / 2;
        this.sea.position.x = 60
        this.sea.position.y = this.WATER_LEVEL;   
        this.sea.receiveShadow = true;
        
        // Save reference to vertices
        const position = this.sea.geometry.attributes.position; 
        position.original = position.array.slice();

        //generating some random patterns to have different waves

        this.waveRandom = [];
        for (let i = 0; i < position.count; i++) {
            this.waveRandom.push({
                amplitude1: 0.2 + Math.random() * 0.6,  //amplitude is height
                amplitude2: 0.1 + Math.random() * 0.4,
                frequency1: 1.5 + Math.random(),        //frequency of waves, basically density
                frequency2: 0.8 + Math.random() * 0.8,
                phase1: Math.random() * Math.PI * 2,    //offset of waves, shift
                phase2: Math.random() * Math.PI * 2,
                speed1: 1.5 + Math.random(),            //speed
                speed2: 0.5 + Math.random()
            });
        }
        this.scene.add(this.sea);
    }

    updateSea(time) {
        const position = this.sea.geometry.attributes.position;
        const original = position.original;

        for (let i = 0; i < position.count; i++) {
            const ix = i * 3;   //x,y,z
            const x = original[ix]; //original x
            const z = original[ix + 1]; //geometrically original Y -> actually world's Z cause the sea plane is rotated -pi/2
            
            // Animate waves
            //make some random waves so every time they are different
            const randoms = this.waveRandom[i];

            const wave1 = Math.sin(x * randoms.frequency1 + time * randoms.speed1 + randoms.phase1) * randoms.amplitude1;
            const wave2 = Math.sin(x * randoms.frequency2 + time * randoms.speed2 + randoms.phase2) * randoms.amplitude2;

            //and interference
            const interference = Math.sin((x + z) / 3 + time * 1.2 + randoms.phase1) * 0.1 * randoms.amplitude1;
            
            const finalWave = wave1 + wave2 + interference;
            position.array[ix + 2] = finalWave;
        }
        position.needsUpdate = true;
        this.sea.geometry.computeVertexNormals();

        this.updatePlatforms(time);
    }


    createBeach() {
        this.beach = new Beach({ width: 10, depth: 200, y: 0 });
        this.beach.create(this.scene, this.platforms);
    }

    createForest() {
        this.forest = new Forest({ 
            width: 200,
            depth: 200, 
            treeCount: 80,
            startX: -45,  // Position behind the beach
            y: 0
        });
        this.forest.create(this.scene, this.platforms);
    }

    async createPlatforms() {   //ship is {x:150, y: -1.5, z: 0}        //partendo da z:-9 e x:70 fare i legni che affondano   
        const rockPositions = [
                                            { x: -30, z: 0 },
                                            { x: -19, z: 5 },
                                            { x: -9, z: -3 },
                                            { x: 5, z: 2 },
                                            { x: 15, z: -4 },
                                            { x: 25, z: 1 },
                                            { x: 40, z: -2 },
                                            { x: 55, z: -4},
                                            { x: 70, z: -10},
                                                                
                        { x: 85, z: -23 },                      { x: 85, z: 6 },
                        { x: 100, z: -30 },                     { x: 100, z: 15 },
                        { x: 120, z: -40 },                     { x: 117, z: 34 }, 
                        { x: 140, z: -27 },                     { x: 130, z: 20 },
                        {x : 137, z: -10 },                     { x: 137, z: 6 },
        ];

        const sinkingLogPositions = [
                                            {x : 80, z: -9 },
                                            {x : 90, z: -9 },
                                            {x : 100, z: -9 },
                                            {x : 110, z: -9 },
                                            {x : 120, z: -9 },
                                            {x : 130, z: -9 },
        ]
        
        const rockMaterial = await createMaterial(
            '../images/moss_rock.jpeg',
            0x808080,   //simple gray fallback
            {
                repeatX: 1,
                repeatY: 1
            }
        );

        const logMaterial = await createMaterial(
            '../images/oak_trunk.jpg',
            0x8B4513,   //simple brown fallback
            {
                repeatX: 1,
                repeatY: 1
            }
        );

        rockPositions.forEach((pos, index) => {
            const size = 3 + Math.random() * 1.5;
            const rockGeometry = new THREE.CylinderGeometry(size, size, 1, 8);
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);

            //initial position ea level
            const base = this.WATER_LEVEL + 0.3 //slightly above
            rock.position.set(pos.x, base, pos.z);
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);

            //floating animation
            const floatingData = {
                originalY: base,
                amplitude: 0.10 + Math.random() * 0.1,   //bobbing height
                frequency: 0.8 + Math.random() * 0.4, // bobbing width
                phase: Math.random() * Math.PI * 2, //random starting offset
                tiltAmplitude: 0.02 + Math.random() * 0.07, //tilting angle
                tiltFrequency: 0.6 + Math.random() * 0.3 //tilting frequency
            };
            
            this.platforms.push({
                mesh: rock,
                bounds: {
                    minX: pos.x - size,
                    maxX: pos.x + size,
                    minZ: pos.z - size,
                    maxZ: pos.z + size,
                    y: base + 0.5
                },
                floatingData: floatingData,
                type: 'rock',
                size: size  //gotta see if i need this for bound updating
            });
        });

        sinkingLogPositions.forEach((pos, index) => {
            const logLenght = 4 + Math.random() *2
            const logRadius = 0.8 + Math.random() * 0.4

            const logGeometry = new THREE.CylinderGeometry(logRadius, logRadius, logLenght, 12);
            
            const log = new THREE.Mesh(logGeometry, logMaterial);

            const base = this.WATER_LEVEL + 0.5; //a bit above water
            log.position.set(pos.x, base, pos.z);
            log.rotation.z = Math.PI / 2; //i want it to lie horizontally
            log.castShadow = true;
            log.receiveShadow = true;
            this.scene.add(log);

            const floatingData = {
                originalY: base,
                amplitude: 0.08 + Math.random() * 0.06,
                frequency: 0.6 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                tiltAmplitude: 0.03 + Math.random() * 0.05,
                tiltFrequency: 0.5 + Math.random() * 0.2
            };

            const sinkingData = {
                isSinking: false,
                sinkStartTime: 0,
                sinkDuration: 2.0,
                playerOnTime: 0,
                triggerDelay: 3.5,
                originalY: base,
                targetY: this.WATER_LEVEL - 2, //idc where, as long as it below water level
                hasPlayerOnIt: false,
                fullySubmerged: false,
                bubbleEffects: []
            };

            this.platforms.push({
                mesh: log,
                bounds: {
                    minX: pos.x - logLenght / 2,
                    maxX: pos.x + logLenght / 2,
                    minZ: pos.z - logRadius,
                    maxZ: pos.z + logRadius,
                    y: base + logRadius
                },
                floatingData: floatingData,
                sinkingData: sinkingData,
                type: 'sinkingLog',
                size: Math.max(logLenght / 2, logRadius)  //gotta see if i need this for bound updating, prolly not but..
            });
        });
    }

    async initializeObstacles() {
        this.obstaclesManager = new Obstacles(this.scene);
        await this.obstaclesManager.init();
        this.obstaclesManager.createObstacles();
    }


    async createShip() {
        this.ship = new Ship(this.scene, {x: 150, y: -1.5, z: 0});
        await this.ship.init();
        
        // Add ship platform to platforms array for collision detection
        if (this.ship.getPlatformBounds()) {
            this.platforms.push({
                mesh: this.ship.getShipGroup(),
                bounds: this.ship.getPlatformBounds(),
                isShip: true // Mark as ship for special handling
            });
        }
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(-250, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -150;   // Cover forest area
        directionalLight.shadow.camera.right = 100;   // Cover ship area
        directionalLight.shadow.camera.top = 150;     // Cover full depth
        directionalLight.shadow.camera.bottom = -150; // Cover full depth
        this.scene.add(directionalLight);

        //create a visual sun (basically yellow ball)
        this.createSun(-250, 100, 50);
    }

    createSun(x, y, z) {
        const sunGeometry = new THREE.SphereGeometry(3, 16, 16);

        const sunMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00, //yellow
            emissive: 0xffaa00, //orange-like
            emissiveIntensity: 0.5
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(x, y, z);

        //a bit of glowing right around the sun, more realistic
        const glowGeometry = new THREE.SphereGeometry(5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff88,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sunGlow.position.set(x, y, z);

        //add both
        this.scene.add(this.sunGlow);
        this.scene.add(this.sun);
    }

    updateObstacles(time) {
        if (this.obstaclesManager) {
            this.obstaclesManager.updateObstacles(time);
        }
    }

    updatePlatforms(time){
        this.platforms.forEach(platform => {
            if (platform.floatingData && !platform.sinkingData?.isSinking){
                const floatingData = platform.floatingData;
                const rock = platform.mesh;

                //vertical bobbing
                const bobbing = Math.sin(time * floatingData.frequency + floatingData.phase) * floatingData.amplitude;
                rock.position.y = floatingData.originalY + bobbing;

                //some tilting motion - rock
                const tiltX = Math.sin(time * floatingData.frequency + floatingData.phase) * floatingData.amplitude;
                const tiltZ = Math.cos(time * floatingData.frequency + floatingData.phase) * floatingData.tiltAmplitude;
                rock.rotation.x = tiltX;
                rock.rotation.z = tiltZ;

                //bounds
                if (platform.type !== 'sinkingLog') {
                    platform.bounds.y = rock.position.y + 0.5;
                }

                if (platform.type === 'sinkingLog') {
                    platform.bounds.y = rock.position.y + platform.size;
                }

            }

            //sinking animation for logs
            if (platform.type === 'sinkingLog' && platform.sinkingData) {
                this.updateSinkingLog(platform, time);
            }
        });
    }

    updateSinkingLog(platform, time) {
        const sinkingData = platform.sinkingData;
        const mesh = platform.mesh;

        if (sinkingData.isSinking) {    //sinking trigger expired, log starts sinking
            const sinkProgress = (time - sinkingData.sinkStartTime) / sinkingData.sinkDuration; //value from 0 (just started) to 1 (fully submerged)

            if (sinkProgress < 1.0) {   // sink it
                const easedProgress = this.easeInQuad(sinkProgress);    //just t*t, seen online that this is the common standard. tried a lot of temporal laws for interpolation. this is the best so far
                const currentY = THREE.MathUtils.lerp(sinkingData.originalY, sinkingData.targetY, 0.75);    //static factor, works better than the dynamic. that depends on game time, it is difficult to fix
                mesh.position.y = currentY;

                const sinkRotation = easedProgress * Math.PI * 0.3; //a bit of rotation while sinking
                mesh.rotation.x = sinkRotation * 0.3;
                mesh.rotation.z = sinkRotation * 0.2;

                if (Math.floor(time * 10) % 5 === 0 && Math.random() < 0.3) {    //periodic bubbles
                    this.createBubbleEffect(mesh.position);
                    console.log('bubble');
                }
                platform.bounds.y = currentY - 2; //update, prolly useless. consistency
            } else {    //if fully sunk
                mesh.position.y = sinkingData.targetY;
                platform.bounds.y = sinkingData.targetY - 3; //way below collision detection
                sinkingData.fullySubmerged = true;
            }
        }
    }
    createBubbleEffect(position) {
        for (let i = 0; i < 3; i++) {
            // Create individual geometry and material for each bubble
            const bubbleGeometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.04, 6, 4); // Vary size slightly
            const bubbleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x87CEEB, 
                transparent: true, 
                opacity: 0.7 + Math.random() * 0.3 // Vary initial opacity
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.set(
                position.x + (Math.random() - 0.5) * 1.5,
                position.y + Math.random() * 0.3,
                position.z + (Math.random() - 0.5) * 1.5
            );
            this.scene.add(bubble);

            // Store animation data on the bubble object
            bubble.data = {
                riseSpeed: 0.015 + Math.random() * 0.01,
                fadeSpeed: 0.006 + Math.random() * 0.004,
                driftX: (Math.random() - 0.5) * 0.008,
                driftZ: (Math.random() - 0.5) * 0.008,
                maxHeight: position.y + 2 + Math.random() * 2
            };

            const animateBubble = () => {
                const data = bubble.data;
                
                bubble.position.y += data.riseSpeed;
                bubble.position.x += data.driftX;
                bubble.position.z += data.driftZ;
                bubble.material.opacity -= data.fadeSpeed;

                if (bubble.material.opacity <= 0 || bubble.position.y > data.maxHeight) {
                    this.scene.remove(bubble);
                    bubble.geometry.dispose();
                    bubble.material.dispose();
                } else {
                    requestAnimationFrame(animateBubble);
                }
            };
            
            animateBubble();
        }
    }
    easeInQuad(t) {
        return t * t;
    }

    checkSinkingLogCollision(playerPosition) {
        this.platforms.forEach(platform => {
            if (platform.type === 'sinkingLog' && platform.sinkingData) {
                const bounds = platform.bounds;
                const sinkingData = platform.sinkingData;
                
                // Check if player is on this log
                const isOnLog = playerPosition.x > bounds.minX && 
                            playerPosition.x < bounds.maxX &&
                            playerPosition.z > bounds.minZ && 
                            playerPosition.z < bounds.maxZ &&
                            playerPosition.y >= bounds.y - 1 &&
                            playerPosition.y <= bounds.y + 1;

                if (isOnLog && !sinkingData.isSinking && !sinkingData.fullySubmerged) {
                    if (!sinkingData.hasPlayerOnIt) {
                        // Player just stepped on the log
                        sinkingData.hasPlayerOnIt = true;
                        sinkingData.playerOnTime = performance.now() * 0.001;   //converting to seconds
                        //console.log('Player stepped on sinking log!');
                    }
                }

                // Check if enough time has passed to start sinking
                if (sinkingData.hasPlayerOnIt && !sinkingData.isSinking && !sinkingData.fullySubmerged) {
                    const timeOnLog = (performance.now() * 0.001) - sinkingData.playerOnTime;
                    if (timeOnLog >= sinkingData.triggerDelay) {
                        sinkingData.isSinking = true;
                        sinkingData.sinkStartTime = performance.now() * 0.001;
                        //console.log('Log starting to sink!');
                    }
                }
                /* else if (!isOnLog) {    Gotta decide if I want this or just let it sink anyway
                    // Player left the log, reset timer if not already sinking
                    if (!sinkingData.isSinking) {
                        sinkingData.hasPlayerOnIt = false;
                        sinkingData.playerOnTime = 0;
                    }
                }*/
            }
        });
    }

    //reset sinked logs after game reset
    resetSinkingLogs() {
        this.platforms.forEach(platform => {
            if (platform.type === 'sinkingLog' && platform.sinkingData) {
                platform.sinkingData.isSinking = false;
                platform.sinkingData.fullySubmerged = false;
                platform.sinkingData.hasPlayerOnIt = false;
                platform.sinkingData.playerOnTime = 0;
                platform.sinkingData.sinkStartTime = 0;

                platform.mesh.position.y = platform.sinkingData.originalY;
                platform.mesh.rotation.x = 0;
                platform.mesh.rotation.z = Math.PI / 2;

                platform.bounds.y = platform.sinkingData.originalY + platform.size;
            }
        });
    }

    updateForest(time) {
        if (this.forest) {
            this.forest.update(time);
        }
    }

    updateShip(time) {
        if (this.ship) {
            this.ship.updateShip(time);
        }
    }

    getPlatforms() {
        return this.platforms;
    }

    getObstacles() {
        return this.obstaclesManager ? this.obstaclesManager.getObstacles() : [];
    }

    getShip() {
        return this.ship.getShipGroup();
    }
}
