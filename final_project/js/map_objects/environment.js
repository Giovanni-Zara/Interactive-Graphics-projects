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
        //this.boat = null;
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
        //this.createBoat();
        this.createLighting();
    }

    createSky() {
        // Option 1: Simple gradient sky using SphereGeometry
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
        
        // Option 2: Alternative - Simple colored sky sphere (uncomment to use instead)
        /*
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB, // Sky blue
            side: THREE.BackSide 
        });
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
        */
        
        // Option 3: Using scene background (uncomment to use instead)
        /*
        // Simple background color
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Or with texture (if you have a skybox texture)
        // const loader = new THREE.TextureLoader();
        // const texture = loader.load('path/to/your/skybox/texture.jpg');
        // this.scene.background = texture;
        */
    }

    /*
    createSea() {
        const seaGeometry = new THREE.PlaneGeometry(200, 200);
        const seaMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x006994,
            transparent: true,
            opacity: 0.8
        });
        const sea = new THREE.Mesh(seaGeometry, seaMaterial);
        sea.rotation.x = -Math.PI / 2;
        sea.position.y = -1; // WATER_LEVEL
        sea.receiveShadow = true;
        this.scene.add(sea);
    }*/

    
    createSea() {
        const seaGeometry = new THREE.PlaneGeometry(200, 200, 100, 100); // (width, height, widthSegment, heightSegment) add segments for waves
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

    /*getSeaLevel(x, z, time){  USELESS
        return this.WATER_LEVEL + Math.sin(x / 5 + time * 2) * 0.5 
                                + Math.cos(z / 5 + time) * 0.3;
    }*/

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

    async createPlatforms() {
        const rockPositions = [
            { x: -30, z: 0 },
            { x: -19, z: 5 },
            { x: -9, z: -3 },
            { x: 5, z: 2 },
            { x: 15, z: -4 },
            { x: 25, z: 1 },
            { x: 35, z: -2 }
        ];
        
        const rockMaterial = await createMaterial(
            '../images/moss_rock.jpeg',
            0x808080,   //simple gray fallback
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
                size: size  //gotta see if i need this for bound updating
            });
        });
    }

    async initializeObstacles() {
        this.obstaclesManager = new Obstacles(this.scene);
        await this.obstaclesManager.init();
        this.obstaclesManager.createObstacles();
    }


    async createShip() {
        this.ship = new Ship(this.scene, {x: 48, y: -1.5, z: 0});
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


    /*
    createBoat() {
        const boatGroup = new THREE.Group();
        
        // Hull
        const hullGeometry = new THREE.BoxGeometry(6, 2, 3);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1;
        hull.castShadow = true;
        boatGroup.add(hull);
        
        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 5;
        mast.castShadow = true;
        boatGroup.add(mast);
        
        // Sail
        const sailGeometry = new THREE.PlaneGeometry(4, 6);
        const sailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(1, 5, 0);
        sail.castShadow = true;
        boatGroup.add(sail);
        
        boatGroup.position.set(50, 0, 0);
        this.scene.add(boatGroup);
        this.boat = boatGroup;
    }*/

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
        // Expand shadow camera to cover the entire game world
        directionalLight.shadow.camera.left = -150;   // Cover forest area
        directionalLight.shadow.camera.right = 100;   // Cover boat area
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
            if (platform.floatingData){
                const floatingData = platform.floatingData;
                const rock = platform.mesh;

                //vertical bobbing
                const bobbing = Math.sin(time * floatingData.frequency + floatingData.phase) * floatingData.amplitude;
                rock.position.y = floatingData.originalY + bobbing;

                //some tilting motion
                const tiltX = Math.sin(time * floatingData.frequency + floatingData.phase) * floatingData.amplitude;
                const tiltZ = Math.cos(time * floatingData.frequency + floatingData.phase) * floatingData.tiltAmplitude;
                rock.rotation.x = tiltX;
                rock.rotation.z = tiltZ;

                //new bounds, gotta see if gonna use
                platform.bounds.y = rock.position.y + 0.5;
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

    getBoat() {
        return this.boat;
    }
}
