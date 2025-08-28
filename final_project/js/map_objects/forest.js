import * as THREE from 'three';
import { createMaterial } from '../texture_loader.js';
// Forest class to create a forest behind the beach line
export class Forest {
    constructor({width = 50, depth = 40, treeCount = 80,startX = -45, y = 0} = {}) {
        this.width = width;
        this.depth = depth;
        this.treeCount = treeCount;
        this.startX = startX;
        this.y = y;
        this.bounds = null;
        this.trees = [];
        this.forestGroup = new THREE.Group();
    }

    async create(scene, platforms) {
        // Create the forest floor first
        await this.createForestFloor(scene, platforms);

        // Generate trees
        await this.generateTrees(platforms);
        
        // Add some bushes and undergrowth
        await this.createUndergrowth(platforms);
        
        // Add the entire forest group to the scene
        scene.add(this.forestGroup);

        

        return this.forestGroup;
    }

    async createForestFloor(scene, platforms) {
        // Create a textured ground for the forest
        const floorGeometry = new THREE.PlaneGeometry(this.width, this.depth);

        const floorMaterial = await createMaterial(
            '../images/forest_floor.jpg',
            0x2F4F2F, //green fallback
            {
                repeatX: 3,
                repeatY: 3
            }
        );
        
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(this.startX - this.width/2, this.y - 0.1, 0);
        floor.receiveShadow = true;
        
        this.forestGroup.add(floor);

        this.bounds = {
            minX: this.startX - this.width,
            maxX: this.startX ,
            minZ: this.y - this.depth/2,
            maxZ: this.y + this.depth/2,
            y: this.y + 0.1
        }
        if (Array.isArray(platforms)) {
            platforms.push({mesh: floor, bounds: this.bounds});
        }
    }


    async generateTrees(platforms) {
        //pre load all the materials
        const trunkMaterial = {
            pine: await createMaterial(
                '../images/pine_trunk.jpg',
                0x8B4513,   //simple brown fallback
                {
                    repeatX: 1,
                    repeatY: 1
                }
            ),
            oak: await createMaterial(
                '../images/oak_trunk.jpg',
                0x8B4513,   //simple brown fallback
                {
                    repeatX: 1,
                    repeatY: 1
                }
            ),
            birch: await createMaterial(
                '../images/birch_trunk.jpg',
                0xF5F5DC,   //simple beige fallback
                {
                    repeatX: 1,
                    repeatY: 1
                }
            )
        };

        const leafMaterials = {
            pine: new THREE.MeshLambertMaterial({ color: 0x228B22 }),   // Dark green for pine
            oak: new THREE.MeshLambertMaterial({ color: 0x32CD32 }),    // Lime green for oak
            birch: new THREE.MeshLambertMaterial({ color: 0x9ACD32 })   // Yellow-green for birch
        };

        // Array to store tree positions for collision checking
        const treePositions = [];
        const minDistance = 4; // Minimum distance between trees
        const maxAttempts = 50; // Maximum attempts to place each tree

        for (let i = 0; i < this.treeCount; i++) {
            let x, z, validPosition = false;
            let attempts = 0;
            
            // Try to find a valid position that doesn't overlap with existing trees
            while (!validPosition && attempts < maxAttempts) {
                x = this.startX - this.width + Math.random() * this.width;
                z = (Math.random() - 0.5) * this.depth;
                
                // Check if this position is far enough from existing trees
                validPosition = true;
                for (const pos of treePositions) {
                    const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            // If we found a valid position or ran out of attempts, place the tree
            if (validPosition || attempts >= maxAttempts) {
                // Store the position
                treePositions.push({ x, z });
                
                // Create different types of trees
                const treeType = Math.random();
                let tree;
                
                if (treeType < 0.4) {
                    tree = this.createPineTree(x, z, trunkMaterial.pine, leafMaterials.pine);
                } else if (treeType < 0.7) {
                    tree = this.createOakTree(x, z, trunkMaterial.oak, leafMaterials.oak);
                } else {
                    tree = this.createBirchTree(x, z, trunkMaterial.birch, leafMaterials.birch);
                }
                
                this.trees.push(tree);
                this.forestGroup.add(tree);
                
                // Add tree collision bounds for trunk collision detection
                const trunkRadius = 1; // Approximate trunk collision radius
                const treeBounds = {
                    minX: x - trunkRadius,
                    maxX: x + trunkRadius,
                    minZ: z - trunkRadius,
                    maxZ: z + trunkRadius,
                    y: this.y + 0.5
                };
                if (Array.isArray(platforms)) {
                    platforms.push({mesh: tree, bounds: treeBounds});
                }
            }
        }
    }

    createPineTree(x, z, trunkMaterial, leafMaterials) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkHeight = 8 + Math.random() * 4;
        const trunkRadius = 0.3 + Math.random() * 0.2;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);


        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Pine needles (multiple cone layers)
        const layers = 3 + Math.floor(Math.random() * 2);
    
        for (let i = 0; i < layers; i++) {
            const layerHeight = trunkHeight * 0.7 + i * 1.5;
            const coneRadius = 2 + Math.random() * 1 - i * 0.3;
            const coneHeight = 3 + Math.random() * 1;
            
            const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
            const cone = new THREE.Mesh(coneGeometry, leafMaterials);
            cone.position.y = layerHeight;
            cone.castShadow = true;
            treeGroup.add(cone);
        }
        
        treeGroup.position.set(x, this.y, z);
        return treeGroup;
    }

    createOakTree(x, z, trunkMaterial, leafMaterials) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkHeight = 6 + Math.random() * 3;
        const trunkRadius = 0.4 + Math.random() * 0.2;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.3, trunkHeight, 8);
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Crown (spherical for oak)
        const crownRadius = 3 + Math.random() * 1.5;
        const crownGeometry = new THREE.SphereGeometry(crownRadius, 8, 6);

        const crown = new THREE.Mesh(crownGeometry, leafMaterials);
        crown.position.y = trunkHeight + crownRadius * 0.5;
        crown.castShadow = true;
        treeGroup.add(crown);
        
        // Add some branches
        const branchCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < branchCount; i++) {
            const branchGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2, 6);
            const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
            
            const angle = (i / branchCount) * Math.PI * 2;
            const branchLength = 1.5;
            branch.position.set(
                Math.cos(angle) * branchLength,
                trunkHeight * 0.7 + Math.random() * 2,
                Math.sin(angle) * branchLength
            );
            branch.rotation.z = Math.cos(angle) * 0.5;
            branch.rotation.x = Math.sin(angle) * 0.5;
            branch.castShadow = true;
            treeGroup.add(branch);
        }
        
        treeGroup.position.set(x, this.y, z);
        return treeGroup;
    }

    createBirchTree(x, z, trunkMaterial, leafMaterials) {
        const treeGroup = new THREE.Group();
        
        // Trunk (white/light colored for birch)
        const trunkHeight = 10 + Math.random() * 4;
        const trunkRadius = 0.2 + Math.random() * 0.1;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.1, trunkHeight, 8);
      
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Crown (smaller, more oval for birch)
        const crownRadiusX = 2 + Math.random() * 0.8;
        const crownRadiusY = 2.5 + Math.random() * 1;
        const crownRadiusZ = 2 + Math.random() * 0.8;
        const crownGeometry = new THREE.SphereGeometry(1, 8, 6);
        crownGeometry.scale(crownRadiusX, crownRadiusY, crownRadiusZ);

        const crown = new THREE.Mesh(crownGeometry, leafMaterials);
        crown.position.y = trunkHeight + crownRadiusY * 0.3;
        crown.castShadow = true;
        treeGroup.add(crown);
        
        treeGroup.position.set(x, this.y, z);
        return treeGroup;
    }

    async createUndergrowth(platforms) {
        // Add bushes and small plants
        const bushMaterial = await createMaterial(
            '../images/bush.jpg',
            0x8B4513,   //simple brown fallback
            {
                repeatX: 1,
                repeatY: 1
            }
        );

        const rockMaterial = await createMaterial(
            '../images/rock.jpg',
            0x808080,   //simple gray fallback
            {
                repeatX: 1,
                repeatY: 1
            }
        );

        const bushCount = Math.floor(this.treeCount * 0.5);
        
        for (let i = 0; i < bushCount; i++) {
            const x = this.startX - this.width + Math.random() * this.width;
            const z = (Math.random() - 0.5) * this.depth;
            
            // Create small bush
            const bushRadius = 0.5 + Math.random() * 0.5;
            const bushGeometry = new THREE.SphereGeometry(bushRadius, 6, 4);
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(x, this.y + bushRadius * 0.5, z);
            bush.castShadow = true;
            
            this.forestGroup.add(bush);

            // Create individual bounds for each bush
            const bushBounds = {
                minX: x - bushRadius,
                maxX: x + bushRadius,
                minZ: z - bushRadius,
                maxZ: z + bushRadius,
                y: this.y + 0.5
            };
            if (Array.isArray(platforms)) {
                platforms.push({mesh: bush, bounds: bushBounds});
            }
        }

        // Add some larger rocks scattered in the forest
        const rockCount = Math.floor(this.treeCount * 0.9);
        
        for (let i = 0; i < rockCount; i++) {
            const x = this.startX - this.width + Math.random() * this.width;
            const z = (Math.random() - 0.5) * this.depth;
            
            const rockSize = 0.8 + Math.random() * 1.2;
            const rockGeometry = new THREE.DodecahedronGeometry(rockSize);
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, this.y + rockSize * 0.5, z);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            
            this.forestGroup.add(rock);

            // Create individual bounds for each rock
            const rockBounds = {
                minX: x - rockSize,
                maxX: x + rockSize,
                minZ: z - rockSize,
                maxZ: z + rockSize,
                y: this.y + 0.5
            };
            if (Array.isArray(platforms)) {
                platforms.push({mesh: rock, bounds: rockBounds});
            }
        }
    }

    // Method to add animated elements (like swaying trees)
    update(time) {
        // Add subtle swaying animation to trees
        this.trees.forEach((tree, index) => {
            if (tree && tree.rotation){
                const swayAmount = 0.08;
                const swaySpeed = 0.7 + (index % 10) * 0.2; // Vary speed per tree
                tree.rotation.z = Math.sin(time * swaySpeed + index) * swayAmount;
            }
        });
    }

    // Get the forest bounds (useful for collision or other game logic)
    getBounds() {
        return {
            minX: this.startX - this.width,
            maxX: this.startX,
            minZ: -this.depth / 2,
            maxZ: this.depth / 2,
            y: this.y
        };
    }

    // Remove forest from scene
    remove(scene) {
        if (this.forestGroup) {
            scene.remove(this.forestGroup);
            this.trees = [];
        }
    }
}
