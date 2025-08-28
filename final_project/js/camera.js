import * as THREE from 'three';
// Camera Manager - Handles all camera controls and movements
export class CameraManager {
    constructor(camera, player, gameLogic = null) {
        this.camera = camera;
        this.player = player;
        this.gameLogic = gameLogic; // Reference to get player rotation
        
        // Camera settings
        this.distance = 12;
        this.height = 6;
        this.angleY = 0;
        this.angleX = -0.3;
        this.followMode = 'smooth';
        
        //camera control mode
        this.cameraControlMode = false;
        this.manualAngleY = 0;

        // Mouse controls
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;

        //camera panoramic mode
        this.isPanning = false;
        this.panOffset = new THREE.Vector3(0, 0, 0);
        this.panSensitivity = 0.02;
        
        // Intro system
        this.introActive = true;
        this.introStartTime = 0;
        this.introDuration = 4;
        this.introStartPosition = { x: 0, y: 40, z: 0 };
        this.introFinalAngleX = -0.05;
        this.introFinalAngleY = -Math.PI/2;
        this.introFinalDistance = 14;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse controls
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.isMouseDown = true;
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.isMouseDown = false;
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (this.isMouseDown && !this.introActive) {
                const deltaX = event.clientX - this.mouseX;
                const deltaY = event.clientY - this.mouseY;
                
                if (this.cameraControlMode) {
                    // In camera control mode, mouse moves the manual camera angle
                    this.manualAngleY -= deltaX * 0.005;
                } else {
                    // In player follow mode, mouse adjusts the offset from player rotation
                    this.angleY -= deltaX * 0.005;
                }
                
                this.angleX += deltaY * 0.005;
                this.angleX = Math.max(-Math.PI/3, Math.min(Math.PI/6, this.angleX));

                // Horizontal movement for camera panning
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this.isPanning = true;

                    // Panning vector
                    const cameraDirection = new THREE.Vector3();
                    this.camera.getWorldDirection(cameraDirection);
                    const rightVector = new THREE.Vector3();
                    rightVector.crossVectors(cameraDirection, this.camera.up).normalize();

                    const panDelta = rightVector.multiplyScalar(-deltaX * this.panSensitivity);
                    this.panOffset.add(panDelta);
                }
                
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        });

        // Mouse wheel for distance
        document.addEventListener('wheel', (event) => {
            if (!this.introActive) {
                this.distance += event.deltaY * 0.01;
                this.distance = Math.max(5, Math.min(25, this.distance));
                event.preventDefault();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.introActive) {
                this.introActive = false;
                return;
            }

            //if I move wasd camera back focusing player
            if (['w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
                this.resetPanning();
            }
        });
    }

    resetPanning() {
        this.isPanning = false;
        this.panOffset.multiplyScalar(0.9); //i want camera to come back to player smoothly
        if (this.panOffset.length() < 0.1) {
            this.panOffset.set(0, 0, 0);
        }
    }

    setCameraControlMode(enabled) {
        this.cameraControlMode = enabled;

        if (enabled) {
            this.manualAngleY = this.getEffectiveAngleY();
        } else {
            this.angleY = 0;
            this.resetPanning();
        }
    }

    rotateCameraAroundPlayer(rotationSpeed) {
        if (this.cameraControlMode) {
            this.manualAngleY += rotationSpeed;
        }
    }

    getEffectiveAngleY() {
        if (this.cameraControlMode) {
            return this.manualAngleY;
        } else {
            // Calculate effective angle based on player rotation
            let baseAngleY = this.angleY;
            if (this.gameLogic && this.gameLogic.playerRotation !== undefined) {
            baseAngleY = this.gameLogic.playerRotation + Math.PI; // Behind the player
            }
            return baseAngleY;
        }
    }

    setupCamera() {
        this.introActive = true;
        this.introStartTime = 0;
        this.camera.position.set(this.introStartPosition.x, this.introStartPosition.y, this.introStartPosition.z);
        this.camera.lookAt(this.player.position);
        this.angleY = this.introFinalAngleY;
        this.angleX = this.introFinalAngleX;
        this.distance = this.introFinalDistance;
        this.panOffset.set(0, 0, 0);
        this.isPanning = false;
        this.cameraControlMode = false;
        this.manualAngleY = 0;
    }

    resetPanning() {
        this.isPanning = false;
        this.panOffset.multiplyScalar(0.9);
        if (this.panOffset.length() < 0.1) {
            this.panOffset.set(0, 0, 0);
        }
    }

    update(gameTime) {
        if (this.introActive) {
            this.updateIntro(gameTime);
        } else {
            this.updatePosition();
        }

        //i want to reduce pan offset gradually when not using panoramic mode
        if (!this.isMouseDown && this.panOffset.length() > 0) {
            this.panOffset.multiplyScalar(0.9);
            if (this.panOffset.length() < 0.1) {
                this.panOffset.set(0, 0, 0);
            }
        }
    }

    updateIntro(gameTime) {
        const elapsed = gameTime - this.introStartTime;
        const progress = Math.min(elapsed / this.introDuration, 1);
        
        const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;
        
        if (progress >= 1) {
            this.introActive = false;
            this.updatePosition();
            return;
        }
        
        const currentX = THREE.MathUtils.lerp(this.introStartPosition.x, 
            this.player.position.x + Math.sin(this.angleY) * this.distance, easeProgress);
        const currentY = THREE.MathUtils.lerp(this.introStartPosition.y, 
            this.player.position.y + this.height + Math.sin(this.angleX) * this.distance * 0.5, easeProgress);
        const currentZ = THREE.MathUtils.lerp(this.introStartPosition.z, 
            this.player.position.z + Math.cos(this.angleY) * this.distance, easeProgress);
        
        this.camera.position.set(currentX, currentY, currentZ);
        
        const lookAtX = THREE.MathUtils.lerp(0, this.player.position.x, easeProgress);
        const lookAtY = THREE.MathUtils.lerp(0, this.player.position.y + 1, easeProgress);
        const lookAtZ = THREE.MathUtils.lerp(0, this.player.position.z, easeProgress);
        
        this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
    }

    updatePosition() {
        // Get player rotation if available and use it as base camera angle
        //let baseAngleY = this.angleY;
        const baseAngleY = this.getEffectiveAngleY();
        /*if (this.gameLogic && this.gameLogic.playerRotation !== undefined) {
            baseAngleY = this.gameLogic.playerRotation + Math.PI; // Behind the player
        }*/
        
        const idealX = this.player.position.x + Math.sin(baseAngleY) * this.distance;
        const idealZ = this.player.position.z + Math.cos(baseAngleY) * this.distance;
        const idealY = this.player.position.y + this.height + Math.sin(this.angleX) * this.distance * 0.5;
        
        const idealPosition = new THREE.Vector3(idealX, idealY, idealZ);
        idealPosition.add(this.panOffset); // Apply pan offset if any
        
        let lerpFactor;
        switch(this.followMode) {   //didn't really implement it, using always smooth
            case 'tight': lerpFactor = 0.25; break;
            case 'smooth': lerpFactor = 0.15; break;
            case 'free': lerpFactor = 0.05; break;
            default: lerpFactor = 0.15;
        }
        
        this.camera.position.lerp(idealPosition, lerpFactor);
        
        const lookAtTarget = new THREE.Vector3( 
            this.player.position.x,
            this.player.position.y + 1,
            this.player.position.z
        );
        lookAtTarget.add(this.panOffset);   //get also pan offset if present, looks more natural
        
        this.camera.lookAt(lookAtTarget);
    }

    isIntroActive() {
        return this.introActive;
    }

    setIntroStartTime(time) {
        this.introStartTime = time;
    }
}
