import * as THREE from 'three';

export class InputHandler {
    constructor(gameLogic) {
        // Reference to the main game logic
        this.gameLogic = gameLogic;
        
        // Input state
        this.keys = {};

        //spint detection
        this.lastWpressTime = 0;
        this.doubleTapdelay = 300; //300 ms
        this.isSprinting = false;
        this.sprintMultiplier = 2.0;

        this.cameraControlMode = false; //false = player rotation |||  true = camera rotation
        
        // Player movement properties (get from gameLogic)
        this.ROTATION_SPEED = gameLogic.ROTATION_SPEED;
        this.MOVE_SPEED = gameLogic.MOVE_SPEED;
        this.JUMP_FORCE = gameLogic.JUMP_FORCE;
        
        // Setup keyboard event listeners
        this.setupInputListeners();
    }

    setupInputListeners() {
        // Keyboard input listeners
        

        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;

            //stop sprinting if w released
            if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
                this.isSprinting = false;
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
                const currentTime = Date.now();
                if (currentTime - this.lastWpressTime < this.doubleTapdelay) {
                    //activate sprint
                    this.isSprinting = true;
                }
                this.lastWpressTime = currentTime;
            }

            this.keys[event.key] = true;
            
            // Handle coordinate toggle
            if (event.key === 'c' || event.key === 'C') {
                this.gameLogic.showCoordinates = !this.gameLogic.showCoordinates;
            }

            //camera mode toggle
            if (event.key === 'v' || event.key === 'V') {
                this.toggleCameraControlMode();
            }
        });
    }

    toggleCameraControlMode() {
        this.cameraControlMode = !this.cameraControlMode;

        if (this.gameLogic.cameraManager) {
            this.gameLogic.cameraManager.setCameraControlMode(this.cameraControlMode);
        }

        //for UI
        this.showControlModeNotification();
    }

    showControlModeNotification() {
        // Create or update notification element
        let notification = document.getElementById('controlModeNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'controlModeNotification';
            document.body.appendChild(notification);
        }

        notification.textContent = this.cameraControlMode ? 
            '📷 Camera Rotation Mode (A/D rotates camera)' : 
            '🚶 Player Rotation Mode (A/D rotates player)';
        
        notification.style.opacity = '1';
        
        // Hide notification after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000);
    }

    handleInput() {
        // Check if should handle input
        if (this.gameLogic.gameState !== 'playing' || 
            !this.gameLogic.cameraManager || 
            this.gameLogic.cameraManager.isIntroActive()) return;
        
        // Reset horizontal velocity
        this.gameLogic.playerVelocity.x = 0;
        this.gameLogic.playerVelocity.z = 0;
        
        // Handle rotation (A/D keys) based on control mode
        if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) {
            if (this.cameraControlMode) {
                // Rotate camera around player
                this.gameLogic.cameraManager.rotateCameraAroundPlayer(this.ROTATION_SPEED);
            } else {
                // Rotate player
                this.gameLogic.playerRotation += this.ROTATION_SPEED;
                this.gameLogic.playerObject.setRotation(this.gameLogic.playerRotation);
            }
        }
        if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
            if (this.cameraControlMode) {
                // Rotate camera around player
                this.gameLogic.cameraManager.rotateCameraAroundPlayer(-this.ROTATION_SPEED);
            } else {
                // Rotate player
                this.gameLogic.playerRotation -= this.ROTATION_SPEED;
                this.gameLogic.playerObject.setRotation(this.gameLogic.playerRotation);
            }
        }
        

        const currentMoveSpeed = this.isSprinting ? this.MOVE_SPEED * this.sprintMultiplier : this.MOVE_SPEED;

        // Forward/backward movement relative to player's rotation
        if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) {
            this.gameLogic.playerVelocity.x = Math.sin(this.gameLogic.playerRotation) * currentMoveSpeed;
            this.gameLogic.playerVelocity.z = Math.cos(this.gameLogic.playerRotation) * currentMoveSpeed;
        }
        if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
            this.gameLogic.playerVelocity.x = -Math.sin(this.gameLogic.playerRotation) * this.MOVE_SPEED;
            this.gameLogic.playerVelocity.z = -Math.cos(this.gameLogic.playerRotation) * this.MOVE_SPEED;
        }
        
        // Jump 
        if (this.keys[' '] && !this.gameLogic.spacePressed && 
            this.gameLogic.jumpCount < this.gameLogic.maxJumps) {
            this.gameLogic.playerVelocity.y = this.JUMP_FORCE;
            this.gameLogic.jumpCount++;
            this.gameLogic.isGrounded = false;
            this.gameLogic.spacePressed = true;
        }
        
        // Reset space pressed flag when key is released, basically allowing double jump
        if (!this.keys[' ']) {
            this.gameLogic.spacePressed = false;
        }
    }

    // Method to get current keys state (useful for debugging)
    getKeys() {
        return this.keys;
    }

    // Method to check if a specific key is pressed
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
}