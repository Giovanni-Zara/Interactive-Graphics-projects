import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/*  BONE STRUCTURE LOGGED IN CONSOLE
Object: unnamed (Type: Group)
  Children: 2
  Object: mixamorigHips (Type: Bone)
    Children: 3
    Object: mixamorigSpine (Type: Bone)
      Children: 1
      Object: mixamorigSpine1 (Type: Bone)
        Children: 1
        Object: mixamorigSpine2 (Type: Bone)
          Children: 5
          Object: mixamorigLeftShoulder (Type: Bone)
            Children: 1
            Object: mixamorigLeftArm (Type: Bone)
              Children: 1
              Object: mixamorigLeftForeArm (Type: Bone)
                Children: 1
                Object: mixamorigLeftHand (Type: Bone)
                  Children: 5
                  Object: mixamorigLeftHandThumb1 (Type: Bone)
                    Children: 1
                    Object: mixamorigLeftHandThumb2 (Type: Bone)
                      Children: 1
                      Object: mixamorigLeftHandThumb3 (Type: Bone)
                        Children: 1
                        Object: mixamorigLeftHandThumb4 (Type: Bone)
                  Object: mixamorigLeftHandRing1 (Type: Bone)
                    Children: 1
                    Object: mixamorigLeftHandRing2 (Type: Bone)
                      Children: 1
                      Object: mixamorigLeftHandRing3 (Type: Bone)
                        Children: 1
                        Object: mixamorigLeftHandRing4 (Type: Bone)
                  Object: mixamorigLeftHandIndex1 (Type: Bone)
                    Children: 1
                    Object: mixamorigLeftHandIndex2 (Type: Bone)
                      Children: 1
                      Object: mixamorigLeftHandIndex3 (Type: Bone)
                        Children: 1
                        Object: mixamorigLeftHandIndex4 (Type: Bone)
                  Object: mixamorigLeftHandMiddle1 (Type: Bone)
                    Children: 1
                    Object: mixamorigLeftHandMiddle2 (Type: Bone)
                      Children: 1
                      Object: mixamorigLeftHandMiddle3 (Type: Bone)
                        Children: 1
                        Object: mixamorigLeftHandMiddle4 (Type: Bone)
                  Object: mixamorigLeftHandPinky1 (Type: Bone)
                    Children: 1
                    Object: mixamorigLeftHandPinky2 (Type: Bone)
                      Children: 1
                      Object: mixamorigLeftHandPinky3 (Type: Bone)
                        Children: 1
                        Object: mixamorigLeftHandPinky4 (Type: Bone)
          Object: mixamorigNeck (Type: Bone)
            Children: 1
            Object: mixamorigHead (Type: Bone)
              Children: 1
              Object: mixamorigHeadTop_End (Type: Bone)
          Object: mixamorigRightShoulder (Type: Bone)
            Children: 1
            Object: mixamorigRightArm (Type: Bone)
              Children: 1
              Object: mixamorigRightForeArm (Type: Bone)
                Children: 1
                Object: mixamorigRightHand (Type: Bone)
                  Children: 5
                  Object: mixamorigRightHandThumb1 (Type: Bone)
                    Children: 1
                    Object: mixamorigRightHandThumb2 (Type: Bone)
                      Children: 1
                      Object: mixamorigRightHandThumb3 (Type: Bone)
                        Children: 1
                        Object: mixamorigRightHandThumb4 (Type: Bone)
                  Object: mixamorigRightHandIndex1 (Type: Bone)
                    Children: 1
                    Object: mixamorigRightHandIndex2 (Type: Bone)
                      Children: 1
                      Object: mixamorigRightHandIndex3 (Type: Bone)
                        Children: 1
                        Object: mixamorigRightHandIndex4 (Type: Bone)
                  Object: mixamorigRightHandMiddle1 (Type: Bone)
                    Children: 1
                    Object: mixamorigRightHandMiddle2 (Type: Bone)
                      Children: 1
                      Object: mixamorigRightHandMiddle3 (Type: Bone)
                        Children: 1
                        Object: mixamorigRightHandMiddle4 (Type: Bone)
                  Object: mixamorigRightHandRing1 (Type: Bone)
                    Children: 1
                    Object: mixamorigRightHandRing2 (Type: Bone)
                      Children: 1
                      Object: mixamorigRightHandRing3 (Type: Bone)
                        Children: 1
                        Object: mixamorigRightHandRing4 (Type: Bone)
                  Object: mixamorigRightHandPinky1 (Type: Bone)
                    Children: 1
                    Object: mixamorigRightHandPinky2 (Type: Bone)
                      Children: 1
                      Object: mixamorigRightHandPinky3 (Type: Bone)
                        Children: 1
                        Object: mixamorigRightHandPinky4 (Type: Bone)
          Object: mixamorigCloak1 (Type: Bone)
            Children: 1
            Object: mixamorigCloak2 (Type: Bone)
              Children: 1
              Object: mixamorigCloak3 (Type: Bone)
                Children: 1
                Object: mixamorigCloak_End (Type: Bone)
          Object: mixamorigHair1 (Type: Bone)
            Children: 1
            Object: mixamorigHair2 (Type: Bone)
              Children: 1
              Object: mixamorigHair3 (Type: Bone)
                Children: 1
                Object: mixamorigHair4 (Type: Bone)
                  Children: 1
                  Object: mixamorigHair5 (Type: Bone)
                    Children: 1
                    Object: mixamorigHair6 (Type: Bone)
                      Children: 1
                      Object: mixamorigHair_End (Type: Bone)
    Object: mixamorigLeftUpLeg (Type: Bone)
      Children: 1
      Object: mixamorigLeftLeg (Type: Bone)
        Children: 1
        Object: mixamorigLeftFoot (Type: Bone)
          Children: 1
          Object: mixamorigLeftToeBase (Type: Bone)
            Children: 1
            Object: mixamorigLeftToe_End (Type: Bone)
    Object: mixamorigRightUpLeg (Type: Bone)
      Children: 1
      Object: mixamorigRightLeg (Type: Bone)
        Children: 1
        Object: mixamorigRightFoot (Type: Bone)
          Children: 1
          Object: mixamorigRightToeBase (Type: Bone)
            Children: 1
            Object: mixamorigRightToe_End (Type: Bone)
  Object: VoidPirate (Type: SkinnedMesh)
    - Mesh with 70590 vertices
    - Position: (0.00, 0.00, 0.00)
    - Scale: (1.00, 1.00, 1.00)

*/

export class Pirate {
    constructor(scene, startPosition = { x: -60, y: 1, z: 0 }) {
        this.scene = scene;
        this.startPosition = startPosition;
        this.mesh = null;
        this.fbxLoader = new FBXLoader();
        this.loaded = false;
        this.animationTime = 0;
        this.INIT_ROTATION = Math.PI/2;
        this.rotation = this.INIT_ROTATION;

        //animation stuff
        this.bodyParts = {};
        this.animation = 'idle';
        this.animationSpeed = 1.0;
        this.animationPhase = 0;
        this.lastAnimation = 'idle';
        this.transitionTime = 0;
        this.transitionDuration = 0.3;  //try with 300ms, check if change
        this.isTransitioning = false;

        //afteranimation reset
        this.needsReset = false;

        this.animationParameters = {
            idle: {
                bodyBob: {amplitude: 0.08, frequency: 2},
                armSwing: {amplitude: 0.1, frequency: 1.5},
                headSwing: {amplitude: 1 , frequency: 1.3},
                neckMove: {amplitude: 0.05, frequency: 1.0},
                breathing: {amplitude: 0.03, frequency: 3.0}
            },
            walk: {
                legSwing: {amplitude: 0.6, frequency: 4},
                armSwing: {amplitude: 0.4, frequency: 4},
                bodyBob: {amplitude: 0.03, frequency: 8},
                stepHeight: 0.1
            },
            sprint: {
                legSwing: {amplitude: 1.0, frequency: 6},
                armSwing: {amplitude: 0.8, frequency: 6},
                bodyBob: {amplitude: 0.05, frequency: 12},
                stepHeight: 0.2,
                bodyLean: 0.1
            },
            jump: {
                armRaise: 0.8,
                elbowBend: 0.6,
                legBend: 0.8,
                bodyArch: 0.3
            }
        };

        this.initialRotations = {};
        this.currentRotations = {};
        this.targetRotations = {};
    }

    async init() {
        try {
            await this.loadPirate();
            this.storeInitialRotations();
            console.log('Pirate initialized successfully');
        } catch (error) {
            console.error('Error initializing pirate:', error);
        }
    }

    async loadPirate() {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                '../objects/pirate_7.4.fbx',
                (object) => {
                    console.log('Pirate FBX loaded successfully');
                    this.setupPirateObject(object);
                    resolve();
                },
                (progress) => {
                    console.log('Pirate loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error('Error loading pirate FBX:', error);
                    reject(error);
                }
            );
        });
    }

    setupPirateObject(object) {
        // Create a group to hold the pirate
        this.mesh = new THREE.Group();

        //to know how body parts are called
        //this.logObjectHierarchy(object);  //too much spam

        // Process the loaded FBX
        object.traverse((child) => {
        if (child.isBone){
            //console.log('FUNGE')
            //console.log(child.name);
            this.bodyParts[child.name] = child;
            console.log(`Registered body part: ${child.name}`);
        }
        if (child.isMesh || child.isSkinnedMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (Array.isArray(child.material)) {
                child.material.forEach(m => { if (m) m.skinning = true; });
            } else if (child.material) {
                child.material.skinning = true;
            }
        }
        
        });

        // Scale 
        object.scale.set(0.07, 0.07, 0.07);

        // Add the pirate object to the group
        this.mesh.add(object);

        //init rotation
        this.mesh.rotation.y = this.INIT_ROTATION;
        this.rotation = this.INIT_ROTATION;

        // Position the pirate group
        this.mesh.position.set(this.startPosition.x, this.startPosition.y, this.startPosition.z);

        // Add to scene
        this.scene.add(this.mesh);

        this.loaded = true;
    }

    storeInitialRotations() {
        Object.keys(this.bodyParts).forEach(boneName => {
            const bone = this.bodyParts[boneName];

            //putting arms down from T pose:
            if (boneName === 'mixamorigLeftArm' || boneName === 'mixamorigRightArm') {
                bone.rotation.x = Math.PI / 4; // rotate arms down
                this.initialRotations[boneName] = {
                    x: bone.rotation.x,
                    y: bone.rotation.y,
                    z: bone.rotation.z
                };
                
            } else {
                this.initialRotations[boneName] = {
                    x: bone.rotation.x,
                    y: bone.rotation.y,
                    z: bone.rotation.z
                };
            }

            this.currentRotations[boneName] = {
                x: bone.rotation.x,
                y: bone.rotation.y,
                z: bone.rotation.z
            };
        });
    }


    setAnimation(newAnimation) {
        if (newAnimation != this.animation) {
            // i need to check if i'm transitioning from some movement to idle
            if ((this.animation === 'walk' || this.animation === 'sprint' || this.animation === 'jump') && newAnimation === 'idle') {
                this.needsReset = true;
            }

            this.lastAnimation = this.animation;
            this.animation = newAnimation;
            this.transitionTime = 0;
            this.isTransitioning = true;
            this.animationPhase = 0;
        }
    }

    update(deltaTime) {
        if (!this.loaded) return;

        this.animationTime += deltaTime;

        if (this.isTransitioning) {
            this.transitionTime += deltaTime;
            if (this.transitionTime >= this.transitionDuration) {
                this.isTransitioning = false;
                this.transitionTime = 0;
            }
        }
        
        this.updateAnimation();
    }

    updateAnimation() {
        const time = this.animationTime;

        if (this.needsReset) {
            this.resetToNaturalPose();
            this.needsReset = false;
        }

        switch (this.animation) {
            case 'idle':
                this.animateIdle(time);
                break;
            case 'walk':
                this.animateWalk(time);
                break;
            case 'sprint':
                this.animateSprint(time);
                break;
            case 'jump':
                this.animateJump(time);
                break;
        }
        this.applyAnimations();
    }

    resetToNaturalPose() {
        Object.keys(this.bodyParts).forEach(boneName => {
            const bone = this.bodyParts[boneName];
            if (bone && this.initialRotations[boneName]) {
                //transition to initial rotation
                bone.rotation.x = this.initialRotations[boneName].x;
                bone.rotation.y = this.initialRotations[boneName].y;
                bone.rotation.z = this.initialRotations[boneName].z;
            }
        });
    }

    animateIdle(time) {
        const params = this.animationParameters.idle;

        //body bob
        const bodyBob = Math.sin(time * params.bodyBob.frequency) * params.bodyBob.amplitude;
        this.setTargetRotation('mixamorigSpine', 'x', bodyBob);

        //breathing
        const breathing = Math.sin(time * params.breathing.frequency) * params.breathing.amplitude;
        this.setTargetRotation('mixamorigSpine1', 'y', breathing);

        //arm swing
        const armSwing = Math.sin(time * params.armSwing.frequency) * params.armSwing.amplitude;
        this.setTargetRotation('mixamorigLeftArm', 'x', armSwing);
        this.setTargetRotation('mixamorigRightArm', 'x', -armSwing);

        //head swing - look left right
        const headSwing = Math.sin(time * params.headSwing.frequency) * params.headSwing.amplitude;
        this.setTargetRotation('mixamorigHead', 'y', headSwing);

        //little neck move
        const neckMove = Math.sin(time * params.neckMove.frequency) * params.neckMove.amplitude;
        this.setTargetRotation('mixamorigNeck', 'y', neckMove);
    }

    animateWalk(time) {
        const params = this.animationParameters.walk;

        //leg move
        const legCycle = Math.sin(time * params.legSwing.frequency) * params.legSwing.amplitude;
        this.setTargetRotation('mixamorigLeftUpLeg', 'x', legCycle);
        this.setTargetRotation('mixamorigRightUpLeg', 'x', -legCycle);

        //knee bend
        const kneeBend = Math.max(0, Math.sin(time * params.legSwing.frequency) * 0.5);
        this.setTargetRotation('mixamorigLeftLeg', 'x', -kneeBend);
        this.setTargetRotation('mixamorigRightLeg', 'x', -kneeBend);

        //arm swing, to be opposite to leg
        const armSwing = Math.sin(time * params.armSwing.frequency) * params.armSwing.amplitude;
        this.setTargetRotation('mixamorigLeftArm', 'z', -armSwing * 0.5);
        this.setTargetRotation('mixamorigRightArm', 'z', armSwing * 0.5);

        //body bob
        const bodyBob = Math.abs(Math.sin(time * params.bodyBob.frequency)) * params.bodyBob.amplitude;
        this.setTargetRotation('mixamorigSpine', 'x', bodyBob);
    }

    animateSprint(time) { //basically same to walk but faster and more pronounced bending
        const params = this.animationParameters.sprint;

        //leg move
        const legCycle = Math.sin(time * params.legSwing.frequency) * params.legSwing.amplitude;
        this.setTargetRotation('mixamorigLeftUpLeg', 'x', legCycle);
        this.setTargetRotation('mixamorigRightUpLeg', 'x', -legCycle);

        //knee bend
        const kneeBend = Math.max(0, Math.sin(time * params.legSwing.frequency) * 1.5);
        this.setTargetRotation('mixamorigLeftLeg', 'x', -kneeBend);
        this.setTargetRotation('mixamorigRightLeg', 'x', -kneeBend);

        //arm swing, to be opposite to leg
        const armSwing = Math.sin(time * params.armSwing.frequency) * params.armSwing.amplitude;
        this.setTargetRotation('mixamorigLeftArm', 'z', armSwing * 0.7);
        this.setTargetRotation('mixamorigRightArm', 'z', armSwing * 0.7);

        //elbow
        const elbowBend = Math.max(0, Math.sin(time * params.armSwing.frequency) * 0.8);
        this.setTargetRotation('mixamorigLeftForearm', 'z', elbowBend);
        this.setTargetRotation('mixamorigRightForearm', 'z', -elbowBend);

        //body bob
        const bodyBob = Math.abs(Math.sin(time * params.bodyBob.frequency)) * params.bodyBob.amplitude;
        this.setTargetRotation('mixamorigSpine1', 'x', bodyBob);

        //body lean
        this.setTargetRotation('mixamorigSpine', 'x', -params.bodyLean);

        //rotation of torso
        const bodySway = Math.sin(time * params.legSwing.frequency) * 0.15;
        this.setTargetRotation('mixamorigSpine2', 'y', bodySway);

        // Additional shoulder movement for more dynamic motion
        const shoulderTwist = Math.sin(time * params.armSwing.frequency) * 0.2;
        this.setTargetRotation('mixamorigLeftShoulder', 'z', shoulderTwist);
        this.setTargetRotation('mixamorigRightShoulder', 'z', -shoulderTwist);

        // Hip oscillation for more realistic running motion
        const hipSwing = Math.sin(time * params.legSwing.frequency) * 0.15;
        this.setTargetRotation('mixamorigHips', 'y', hipSwing);
        this.setTargetRotation('mixamorigHips', 'z', hipSwing * 0.5);

        // Head movement to follow body motion
        const headBob = Math.sin(time * params.bodyBob.frequency * 0.5) * 0.05;
        this.setTargetRotation('mixamorigHead', 'x', headBob);
        this.setTargetRotation('mixamorigNeck', 'y', bodySway * 0.3);

    }

    animateJump(time) {
        const params = this.animationParameters.jump;

        //raise arms
        this.setTargetRotation('mixamorigLeftArm', 'x', -params.armRaise);
        this.setTargetRotation('mixamorigRightArm', 'x', -params.armRaise);

        //elbow
        //const elbow = Math.max(0, Math.sin(time * params.elbowBend.frequency) * 1.5);
        this.setTargetRotation('mixamorigLeftForearm', 'z', 10);
        this.setTargetRotation('mixamorigRightForearm', 'z', params.elbowBend);

        //bend legs
        this.setTargetRotation('mixamorigLeftUpLeg', 'x', params.legBend * 0.6);
        this.setTargetRotation('mixamorigLeftLeg', 'x', -params.legBend * 1.5);

        this.setTargetRotation('mixamorigRightUpLeg', 'x', params.legBend * 0.6);
        this.setTargetRotation('mixamorigRightLeg', 'x', -params.legBend * 1.5);

        //body arch
        this.setTargetRotation('mixamorigSpine', 'x', -params.bodyArch);
/*
        Object.keys(this.bodyParts).forEach(boneName => {
            const bone = this.bodyParts[boneName];
            this.applyNaturalPose(bone, boneName);
        });*/

    }

    setTargetRotation(boneName, axis, value) {
        if (!this.targetRotations[boneName]) {
            this.targetRotations[boneName] = {x: 0, y: 0, z: 0};
        }
        this.targetRotations[boneName][axis] = value;
    }

    applyAnimations() {
        Object.keys(this.bodyParts).forEach(boneName => {
            const bone = this.bodyParts[boneName];
            const initial = this.initialRotations[boneName];
            const target = this.targetRotations[boneName];

            if (bone && initial && target) {
                //interpolation
                const lerpFactor = this.isTransitioning ? Math.min(this.transitionTime / this.transitionDuration, 1.0) * 0.3 : 0.1;

                bone.rotation.x = THREE.MathUtils.lerp(
                    bone.rotation.x, 
                    initial.x + target.x,
                    lerpFactor
                );

                bone.rotation.y = THREE.MathUtils.lerp(
                    bone.rotation.y,
                    initial.y + target.y,
                    lerpFactor
                );

                bone.rotation.z = THREE.MathUtils.lerp(
                    bone.rotation.z,
                    initial.z + target.z,
                    lerpFactor
                );
            }
        });
        //reset for next frame
        this.targetRotations = {};
    }

    forceResetPose() {  //debug, if need manual reset for later
        this.resetToNaturalPose();
        this.needsReset = false;
        this.targetRotations = {};
    }

    logObjectHierarchy(object, depth = 0) {
        const indent = ' '.repeat(depth);
        console.log(`${indent}Object: ${object.name || 'unnamed'} (Type: ${object.type})`);

        if (object.isMesh) {
        console.log(`${indent}  - Mesh with ${object.geometry.attributes.position.count} vertices`);
        console.log(`${indent}  - Position: (${object.position.x.toFixed(2)}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)})`);
        console.log(`${indent}  - Scale: (${object.scale.x.toFixed(2)}, ${object.scale.y.toFixed(2)}, ${object.scale.z.toFixed(2)})`);
        }
    
        if (object.children && object.children.length > 0) {
            console.log(`${indent}  Children: ${object.children.length}`);
            object.children.forEach(child => {
                this.logObjectHierarchy(child, depth + 1);
            });
        }

    }

    getBodyParts() {    //list
        return Object.keys(this.bodyParts);
    }

    getBodyPart(name) { //single part
        return this.bodyParts[name];
    }

    setRotation(rotation) {
        this.rotation = rotation;
        if (this.mesh) {
            this.mesh.rotation.y = rotation;
        }
    }

        // Get distance to another object
    distanceTo(targetPosition) {
        if (this.mesh.position) {
            return this.mesh.position.distanceTo(targetPosition);
        }
        return Infinity;
    }

    reset(){
        this.mesh.position.set(this.startPosition.x, this.startPosition.y, this.startPosition.z);
        this.mesh.rotation.set(0, this.INIT_ROTATION, 0);
        this.rotation = this.INIT_ROTATION;
    }


    
}