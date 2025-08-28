// Simple, working Beach class
import * as THREE from 'three';
import { createMaterial } from '../texture_loader.js';

export class Beach {
    constructor({ width = 120, depth = 24, y = 0 } = {}) {
        this.width = width;
        this.depth = depth;
        this.y = y;        // beach height
        this.mesh = null;
        this.bounds = null;
    }

    async create(scene, platforms) {
        // Geometry
        const geom = new THREE.PlaneGeometry(this.width, this.depth);
        // Visible material (simple color to verify)
        const mat = await createMaterial(
            '../images/beach_texture.jpg',
            0xE4C07A,   // sandy color fallback
            { repeatX: 6, repeatY: 6 }  
        );
        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.rotation.x = -Math.PI / 2;   // lay flat
        this.mesh.position.set(-40.5, this.y, 0);
        this.mesh.receiveShadow = true;

        scene.add(this.mesh);

        // Register as platform (bounds derived from size/position)
        this.bounds = {
            minX: this.mesh.position.x - this.width / 2,
            maxX: this.mesh.position.x + this.width / 2,
            minZ: -this.depth / 2,
            maxZ: this.depth / 2,
            y: this.y + 0.1
        };
        if (Array.isArray(platforms)) {
            platforms.push({ mesh: this.mesh, bounds: this.bounds });
        }

        return this.mesh;
    }
}