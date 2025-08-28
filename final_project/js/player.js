import * as THREE from 'three';
// Player class - Handles player creation, movement, and customization
export class Player {
    constructor(scene, startPosition = { x: -60, y: 3, z: 0 }) {
        this.scene = scene;
        this.mesh = null;
        this.rotation = 0;
        this.startPosition = startPosition;
        
        // Player properties
        this.color = 0xff6b6b; // Default red color
        this.size = { width: 1, height: 2, depth: 1 };
        
        this.create();
    }

    create() {
        // Create player geometry
        const playerGeometry = new THREE.BoxGeometry(
            this.size.width, 
            this.size.height, 
            this.size.depth
        );
        
        // Create player material
        const playerMaterial = new THREE.MeshLambertMaterial({ 
            color: this.color 
        });
        
        // Create player mesh
        this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.mesh.position.set(
            this.startPosition.x, 
            this.startPosition.y, 
            this.startPosition.z
        );
        this.mesh.castShadow = true;
        
        // Add to scene
        this.scene.add(this.mesh);
        
        return this.mesh;
    }

    // Get the player's Three.js mesh
    getMesh() {
        return this.mesh;
    }

    // Get the player's position
    getPosition() {
        return this.mesh ? this.mesh.position : null;
    }

    // Set the player's position
    setPosition(x, y, z) {
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }

    // Get the player's rotation
    getRotation() {
        return this.rotation;
    }

    // Set the player's rotation
    setRotation(rotation) {
        this.rotation = rotation;
        if (this.mesh) {
            this.mesh.rotation.y = rotation;
        }
    }

    // Update player rotation based on input
    rotate(rotationSpeed) {
        this.rotation += rotationSpeed;
        if (this.mesh) {
            this.mesh.rotation.y = this.rotation;
        }
    }

    // Reset player to starting position and rotation
    reset() {
        this.setPosition(this.startPosition.x, this.startPosition.y, this.startPosition.z);
        this.setRotation(0);
    }

    // Customize player appearance
    setColor(color) {
        this.color = color;
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(color);
        }
    }

    // Change player size
    setSize(width, height, depth) {
        this.size = { width, height, depth };
        
        if (this.mesh) {
            // Store current position and rotation
            const currentPos = this.mesh.position.clone();
            const currentRot = this.mesh.rotation.clone();
            
            // Remove old mesh
            this.scene.remove(this.mesh);
            
            // Create new mesh with new size
            this.create();
            
            // Restore position and rotation
            this.mesh.position.copy(currentPos);
            this.mesh.rotation.copy(currentRot);
        }
    }

    // Remove player from scene
    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
    }

    // Get distance to another object
    distanceTo(targetPosition) {
        if (this.mesh) {
            return this.mesh.position.distanceTo(targetPosition);
        }
        return Infinity;
    }
}