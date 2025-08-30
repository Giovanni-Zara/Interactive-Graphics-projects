import * as THREE from 'three';
// Game Logic - Core game mechanics and state management
import { Environment } from './map_objects/environment.js';
import { CameraManager } from './camera.js';
import { Pirate} from './player3.js';
import { InputHandler } from './input_handler.js';
//import { Ship } from './map_objects/ship.js';

export class GameLogic {
    constructor() {
        // Core Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.playerObject = null; // Player class instance
        
        // Game managers
        this.environment = null;
        this.cameraManager = null;
        this.inputHandler = null;
        
        // Game state
        this.gameState = 'menu';
        this.lives = 3;
        this.gameTime = 0;
        this.gameInitialized = false;
        this.showCoordinates = true;

        //win condition
        this.onShipStartTime = null;
        this.WIN_DELAY = 3.0
        this.isOnShip = false;

        // Player state
        this.playerVelocity = { x: 0, y: 0, z: 0 };
        const INIT_ROTATION = Math.PI/2;
        this.playerRotation = INIT_ROTATION; // Player's rotation angle in radians
        this.isGrounded = false;
        this.jumpCount = 0; // Track number of jumps (0, 1, or 2)
        this.maxJumps = 2; // Allow double jump
        this.spacePressed = false; // Track if space was just pressed

        //animation state
        this.isMoving = false;
        this.isSprinting = false;
        this.isJumping = false;
        this.lastFrameTime = 0;
        this.isDrowning = false;
        this.drowningStartTime = 0;
        this.DROWNING_DURATION = 3.0;

        // Game constants
        this.GRAVITY = -0.015;
        this.JUMP_FORCE = 0.3;
        this.MOVE_SPEED = 0.12;
        this.WATER_LEVEL = -1;
        this.ROTATION_SPEED = 0.04; // How fast the player rotates
        this.SKY_COLOR = 0x87CEEB; // Light blue sky/water color
        this.PLAYER_HEIGHT_OFFSET = 0; // Height above platforms/water
        this.OBSTACLE_COLLISION_DISTANCE = 1.5;
        this.BOAT_REACH_DISTANCE = 5;
        
        this.setupInputHandlers();
        
        // Initialize input handler
        this.inputHandler = new InputHandler(this);
    }

    setupInputHandlers() {
        // Window resize (keep this in gameLogic since it's related to renderer/camera)
        window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    async startGame(shadowsEnabled, progressCallback = null) {
        if (!this.gameInitialized) {
            console.log('Initializing game...');
            try {
                await this.initializeGame(shadowsEnabled, progressCallback);
                this.gameInitialized = true;
                console.log('Game initialized successfully');
            } catch (error) {
                console.error('Error initializing game:', error);
                return;
            }
        } else {
            this.restartGame();
        }
        
        this.gameState = 'playing';
        if (this.cameraManager) {
            this.cameraManager.setIntroStartTime(this.gameTime);
        }
    }

    async initializeGame(shadowsEnabled, progressCallback = null) {
        try {
            const updateProgress = (progress, message) => {
                if (progressCallback) {
                    progressCallback(progress, message);
                }
            };

            updateProgress(10, "Creating scene...");

            // Create scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(this.SKY_COLOR, 50, 200);
            console.log('Scene created');

            updateProgress(20, "Creating camera...");
            // Create camera
            this.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);   //PerspectiveCamera(fov, aspect, near, far)
            console.log('Camera created');

            updateProgress(30, "Creating renderer...");
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(this.SKY_COLOR);
            this.updateShadowSettings(shadowsEnabled);
            
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.appendChild(this.renderer.domElement);
                console.log('Renderer added to DOM');
            } else {
                console.error('Game container not found!');
                return;
            }

            updateProgress(40, "Building the environment...");
            // Create environment
            this.environment = new Environment(this.scene);
            await this.environment.createWorld();
            console.log('Environment created');

            updateProgress(70, "Loading Captain Jack Sparrow...");
            // Create player
            this.playerObject = new Pirate(this.scene, { x: -150, y: 1, z: -10 }); //-60 1 0
            await this.playerObject.init();
            console.log('Player created');

            let attempts = 0;
            while (!this.playerObject.loaded && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait for player mesh to load
                attempts++;
            }

            if (!this.playerObject.loaded) {
                console.error('jack sparrow failed to initialize properly');
                return;
            }

            console.log('jack sparrow loaded, waiting for mesh...');


            // Additional wait for mesh to be properly initialized
            attempts = 0;
            while ((!this.playerObject.mesh || !this.playerObject.mesh.position) && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!this.playerObject.mesh) {
                console.error('jack sparrow mesh failed to initialize properly');
                return;
            }

            updateProgress(90, "Setting up lights...");
            // Setup camera manager
            this.cameraManager = new CameraManager(this.camera, this.playerObject.mesh, this);
            this.cameraManager.setupCamera();
            console.log('Camera manager created');

            updateProgress(100, "Game initialization complete!");

            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure everything is ready

        } catch (error) {
                console.error('Error initializing game:', error);
        }
    }

    updateShadowSettings(enabled) {
        if (this.renderer) {
            this.renderer.shadowMap.enabled = enabled;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.needsUpdate = true;
        }
    }

    handleInput() {
        // Delegate input handling to the InputHandler
        this.inputHandler.handleInput();
    }

    updatePlayer() {
        if (!this.playerObject || !this.playerObject.mesh || !this.playerObject.loaded) {
            console.warn('player mesh not found');
            return;
        }

        const playerMesh = this.playerObject.mesh;
        if (!playerMesh || !playerMesh.position) {
            console.warn('Player mesh position not available');
            return;
        }

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) * 0.001; // Convert to seconds
        this.lastFrameTime = currentTime;

        //handle drowning
        if (this.isDrowning) {
            this.updateDrowning(deltaTime);
            this.playerObject.update(deltaTime);
            return;
        }

        // Apply gravity
        if (!this.isGrounded){
            this.playerVelocity.y += this.GRAVITY;
        } else {    //small damping to fix micro fluctuations
            this.playerVelocity.y = Math.max(0, this.playerVelocity.y);
        }
        // Update position
        playerMesh.position.x += this.playerVelocity.x;
        playerMesh.position.y += this.playerVelocity.y;
        playerMesh.position.z += this.playerVelocity.z;

        if (playerMesh.rotation.y !== this.playerRotation){
            playerMesh.rotation.y = this.playerRotation;
        }

        this.updatePlayerAnimation();
        this.playerObject.update(deltaTime);

        // Check collisions
        this.checkPlatformCollisions();
        this.checkSolidCollisions(); // Add solid collision check
        this.checkObstacleCollisions();

        //log collision
        this.environment.checkSinkingLogCollision(playerMesh.position);
        
        // Check water collision

        if (playerMesh.position.y <= this.WATER_LEVEL) {
            this.startDrowning();
        }

        this.checkShipWinCondition(playerMesh);
    }

    
    updatePlayerAnimation() {
        if (this.isDrowning) {
            return;     //if drowning keep the animation active
        }

        const horizontalSpeed = Math.sqrt(this.playerVelocity.x * this.playerVelocity.x + this.playerVelocity.z * this.playerVelocity.z);   //simple triangle theorem
        this.isMoving = horizontalSpeed > 0.01;
        this.isJumping = !this.isGrounded;

        this.isSprinting = this.inputHandler.isSprinting;

        if (this.isJumping) {
            this.playerObject.setAnimation('jump');
        } else if (this.isMoving) {
            if (this.isSprinting) {
                this.playerObject.setAnimation('sprint');
            } else {
                this.playerObject.setAnimation('walk');
            }
        } else {
            this.playerObject.setAnimation('idle');
        }
    }

    setSprinting(sprinting) {   //for input handler
        this.isSprinting = sprinting;
    }

    checkPlatformCollisions() {
        this.isGrounded = false;
        const platforms = this.environment.getPlatforms();
        const playerMesh = this.playerObject.mesh;

        platforms.forEach((platform, index) => {
            const bounds = platform.bounds;
            
            if (playerMesh.position.x > bounds.minX && playerMesh.position.x < bounds.maxX &&
                playerMesh.position.z > bounds.minZ && playerMesh.position.z < bounds.maxZ) {
                
                // Debug: Log which platform is being triggered
                //console.log(`Platform ${index} triggered at X=${playerMesh.position.x.toFixed(2)}, bounds: ${bounds.minX.toFixed(1)} to ${bounds.maxX.toFixed(1)}`);
                
                const targetY = bounds.y;
                const tolerance = 0.5;
                if (this.playerVelocity.y <= 0 && 
                    playerMesh.position.y <= targetY + tolerance && 
                    playerMesh.position.y > bounds.y - tolerance) {

                    playerMesh.position.y = targetY;
                    this.playerVelocity.y = 0;
                    this.isGrounded = true;
                    this.jumpCount = 0; // Reset jump count when touching ground
                }
            }
        });
    }

    checkSolidCollisions() {
        const platforms = this.environment.getPlatforms();
        const playerMesh = this.playerObject.mesh;

        platforms.forEach(platform => {
            // Check if this is a solid object by checking geometry type
            let isSolidObject = false;
            
            // Direct mesh check (for bushes and rocks)
            if (platform.mesh && platform.mesh.geometry && 
                (platform.mesh.geometry.type === 'SphereGeometry' || 
                 platform.mesh.geometry.type === 'DodecahedronGeometry')) {
                isSolidObject = true;
            }
            
            // Group check (for trees) - check if it has children with cylinder geometry
            if (platform.mesh && platform.mesh.isGroup && platform.mesh.children) {
                for (const child of platform.mesh.children) {
                    if (child.geometry && child.geometry.type === 'CylinderGeometry') {
                        isSolidObject = true;
                        break;
                    }
                }
            }
            
            if (isSolidObject) {
                
                const bounds = platform.bounds;
                const playerRadius = 0.5; // Approximate player collision radius
                
                // Check if player is trying to enter the solid object's bounds
                if (playerMesh.position.x + playerRadius > bounds.minX && 
                    playerMesh.position.x - playerRadius < bounds.maxX &&
                    playerMesh.position.z + playerRadius > bounds.minZ && 
                    playerMesh.position.z - playerRadius < bounds.maxZ &&
                    playerMesh.position.y < bounds.y + 2) { // Check height range
                    
                    // Calculate push-back direction
                    const centerX = (bounds.minX + bounds.maxX) / 2;
                    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
                    
                    const deltaX = playerMesh.position.x - centerX;
                    const deltaZ = playerMesh.position.z - centerZ;
                    
                    // Find the distance to the object center
                    const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
                    
                    if (distance > 0) {
                        // Calculate the minimum distance needed to clear the object
                        const objectRadius = Math.max((bounds.maxX - bounds.minX) / 2, (bounds.maxZ - bounds.minZ) / 2);
                        const minDistance = objectRadius + playerRadius + 0.1; // Add small buffer
                        
                        // Only push if we're too close
                        if (distance < minDistance) {
                            // Normalize direction and push to safe distance
                            const pushX = (deltaX / distance) * minDistance;
                            const pushZ = (deltaZ / distance) * minDistance;
                            
                            playerMesh.position.x = centerX + pushX;
                            playerMesh.position.z = centerZ + pushZ;
                            
                            // Reset horizontal velocity to prevent sliding
                            this.playerVelocity.x = 0;
                            this.playerVelocity.z = 0;
                        }
                    } else {
                        // If player is exactly at center, push them backward
                        playerMesh.position.z += playerRadius + 0.5;
                        this.playerVelocity.x = 0;
                        this.playerVelocity.z = 0;
                    }
                }
            }
        });
    }

    checkObstacleCollisions() {
        const obstacles = this.environment.getObstacles();
        const playerMesh = this.playerObject.mesh;
        obstacles.forEach(obstacle => {
            const distance = playerMesh.position.distanceTo(obstacle.mesh.position);
            if (distance < this.OBSTACLE_COLLISION_DISTANCE) {
                this.loseLife();
            }
        });
    }

    loseLife() {
        if (this.gameState !== 'playing') return;
        
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPlayerPosition();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverScreen').style.display = 'block';
    }

    winGame() {
        this.gameState = 'won';
        document.getElementById('winScreen').style.display = 'block';
    }

    restartGame() {
        this.gameState = 'playing';
        this.lives = 3;
        document.getElementById('lives').textContent = this.lives;

        this.resetShipTimer();
        
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('winScreen').style.display = 'none';
        
        this.resetPlayerPosition();
        if (this.cameraManager) {
            this.cameraManager.setupCamera();
            this.cameraManager.setIntroStartTime(this.gameTime);
        }
    }

    resetPlayerPosition() {
        this.isDrowning = false;
        this.hideDrowningMessage();

        this.playerObject.reset();
        this.playerRotation = this.playerObject.INIT_ROTATION;
        this.playerVelocity = { x: 0, y: 0, z: 0 };
        this.jumpCount = 0; // Reset jump count
        this.spacePressed = false; // Reset space key state
        this.resetShipTimer();
        this.environment.resetSinkingLogs();
    }

    updateCoordinateDisplay() {
        const coordElement = document.getElementById('coordinates');
        if (coordElement) {
            if (this.showCoordinates && this.playerObject && this.playerObject.mesh) {
                const playerMesh = this.playerObject.mesh;
                coordElement.style.display = 'block';
                coordElement.textContent = 
                    `X: ${playerMesh.position.x.toFixed(2)}, Y: ${playerMesh.position.y.toFixed(2)}, Z: ${playerMesh.position.z.toFixed(2)}`;
            } else {
                coordElement.style.display = 'none';
            }
        }
    }

    startGameLoop() {
        this.gameLoop();
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        if (!this.gameInitialized || !this.renderer || !this.scene || !this.camera) return;
        
        this.gameTime += 0.016;
        
        if (this.gameState === 'playing') {
            this.handleInput();
            this.updatePlayer();
            if (this.cameraManager) {
                this.cameraManager.update(this.gameTime);
            }
            this.updateCoordinateDisplay();
            this.environment.updateObstacles(this.gameTime);
            this.environment.updateSea(this.gameTime);
            this.environment.updateForest(this.gameTime);
            this.environment.updateShip(this.gameTime);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    setGameState(state) {
        this.gameState = state;
    }



    /*------------------------------------------------SHIP REACHING WIN -----------------------------------------*/

    checkShipWinCondition(playerMesh) {
        const ship = this.environment.getShip();
        if (ship && this.environment.ship) {
            const currentlyOnShip = this.environment.ship.isPlayerOnShip(playerMesh.position);
            
            if (currentlyOnShip) {
                if (!this.isOnShip) {
                    // Player just got on ship
                    this.isOnShip = true;
                    this.onShipStartTime = this.gameTime;
                    console.log('Player reached ship! Starting win timer...');
                    this.showWinTimer();
                }
                
                // Check if enough time has passed
                const timeOnShip = this.gameTime - this.onShipStartTime;
                this.updateWinTimer(timeOnShip);
                
                if (timeOnShip >= this.WIN_DELAY) {
                    console.log('Win timer completed! Winning game...');
                    this.hideWinTimer();
                    this.winGame();
                }
            } else {
                if (this.isOnShip) {
                    // Player left the ship, reset timer
                    console.log('Player left ship, resetting win timer...');
                    this.resetShipTimer();
                }
            }
        }
    }

    resetShipTimer() {
        this.isOnShip = false;
        this.onShipStartTime = 0;
        this.hideWinTimer();
    }

    showWinTimer() {
        // Create or show the win timer UI
        let timerElement = document.getElementById('winTimer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'winTimer';
            document.body.appendChild(timerElement);
        }
        timerElement.style.display = 'block';
    }

    updateWinTimer(timeOnShip) {
        const timerElement = document.getElementById('winTimer');
        if (timerElement) {
            const remainingTime = Math.max(0, this.WIN_DELAY - timeOnShip);
            const seconds = Math.ceil(remainingTime);
            
            if (seconds > 0) {
                timerElement.innerHTML = `
                    <div>🚢 Boarding the Ship! 🚢</div>
                    <div style="font-size: 18px; margin-top: 10px;">
                        Securing victory in: ${seconds}s
                    </div>
                `;
            } else {
                timerElement.innerHTML = `
                    <div>🎉 Victory Secured! 🎉</div>
                `;
            }
        }
    }

    hideWinTimer() {
        const timerElement = document.getElementById('winTimer');
        if (timerElement) {
            timerElement.style.display = 'none';
        }
    }



    /* --------------------------------------------- DROWNING PART --------------------------------------- */
    startDrowning() {
        if (this.isDrowning || this.gameState !== 'playing') return;

        this.isDrowning = true;
        this.drowningStartTime = this.gameTime;

        //stop all movement and start drowning animation
        this.playerVelocity = {x: 0, y: 0, z: 0};
        this.playerObject.setAnimation('drown');

        this.showDrowningMessage();
    }

    updateDrowning(deltaTime) {
        const drowningTime = this.gameTime - this.drowningStartTime;

        const drownSpeed = 0.02;    //slow drowning
        this.playerObject.mesh.position.y -= drownSpeed;

        this.updateDrowningMessage(drowningTime);

        if (drowningTime >= this.DROWNING_DURATION) {
            this.completeDrowning();
        }
    }

    completeDrowning() {
        this.isDrowning = false;
        this.hideDrowningMessage();

        this.playerObject.setAnimation('idle');
        this.loseLife();
    }

    showDrowningMessage() {
        let drowningElement = document.getElementById('drowningMessage');
        if (!drowningElement) {
            drowningElement = document.createElement('div');
            drowningElement.id = 'drowningMessage';
            document.body.appendChild(drowningElement);
        }
        drowningElement.style.display = 'block';
    }

    updateDrowningMessage(drowningTime) {
        const drowningElement = document.getElementById('drowningMessage');
        if (drowningElement) {
            const remainingTime = Math.max(0, this.DROWNING_DURATION - drowningTime);
            const seconds = Math.ceil(remainingTime);

            if (seconds > 0) {
                drowningElement.innerHTML = `
                    <div>🌊 DROWNING! 🌊</div>
                    <div style="font-size: 18px; margin-top: 10px;">
                        Blub blub blub...${seconds}s
                    </div>
                `;
            } else {
                drowningElement.innerHTML = `
                    <div>💀💀💀💀</div>
                `;
            }
        }
    }

    hideDrowningMessage() {
        const drowningElement = document.getElementById('drowningMessage');
        if (drowningElement) {
            drowningElement.style.display = 'none';
        }
    }
}
