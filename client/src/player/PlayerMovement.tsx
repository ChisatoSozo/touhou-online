import { Mesh, PhysicsImpostor, Quaternion, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { GroundMesh } from '@babylonjs/core/Meshes/groundMesh';
import React, { MutableRefObject, useCallback, useContext, useEffect, useState } from 'react';
import { OctreeContext } from '../containers/OctreeContext';
import { TerrainContext } from '../containers/TerrainContext';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { useXRCamera } from '../hooks/useXR';
import { MovementState } from './Player';
import { doFalling } from './playerMovement/Falling';
import { doFloating } from './playerMovement/Floating';
import { doFlying } from './playerMovement/Flying';
import { doWalking } from './playerMovement/Walking';

const playerPosition = new Vector3(0, 500, 0)

export const movementStateRef: MutableRefObject<MovementState> = {
    current: "walking"
}

export type MovementUpdateFunction = (deltaS: number, transform: Mesh, ground: GroundMesh | undefined, head: TransformNode, scene: Scene, createPhysics: () => PhysicsImpostor | undefined) => void;

interface PlayerMovementProps {
    head: MutableRefObject<TransformNode | undefined>
}

export const PlayerMovement: React.FC<PlayerMovementProps> = ({ head, children }) => {
    const xrCamera = useXRCamera();
    const [sphere, setSphere] = useState<Mesh>()
    const { octree } = useContext(OctreeContext)
    useEffect(() => {
        if (sphere && octree) {
            octree.dynamicContent.push(sphere);
            const _sphere = sphere;
            return () => {
                if (!octree) return;
                octree.dynamicContent = octree.dynamicContent.filter(elem => elem !== _sphere)
            }
        }
    }, [sphere, octree])

    const { ground } = useContext(TerrainContext);

    const onCollision = useCallback(() => {
        movementStateRef.current = "walking";
        if (!sphere?.physicsImpostor || !head.current) return;
        sphere.physicsImpostor.dispose()
        sphere.physicsImpostor = null;
        head.current.position = new Vector3(0, 1.88, 0);
    }, [head, sphere])

    const createPhysics = useCallback(() => {
        if (!sphere || !ground) return;
        const newPhysicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9,
            friction: 1,
        })
        newPhysicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor as PhysicsImpostor, onCollision)
        newPhysicsImpostor.physicsBody.angularDamping = 1;
        return newPhysicsImpostor
    }, [sphere, ground, onCollision])

    useDeltaBeforeRender((scene, deltaS) => {
        if (!sphere || !head.current) return

        switch (movementStateRef.current) {
            case "walking":
                doWalking(deltaS, sphere, ground, head.current, scene, createPhysics)
                break;
            case "falling":
                doFalling(deltaS, sphere, ground, head.current, scene, createPhysics)
                break;
            case "floating":
                doFloating(deltaS, sphere, ground, head.current, scene, createPhysics)
                break;
            case "flying":
                doFlying(deltaS, sphere, ground, head.current, scene, createPhysics)
                break;
            default:
                throw new Error("movement state not implemented: " + movementStateRef.current)
        }

        if (movementStateRef.current !== "flying") {
            sphere.rotationQuaternion = new Quaternion()
        }

    });

    return <sphere name="cameraPosition" diameter={0.5} segments={4} ref={(sphere: Mesh) => setSphere(sphere)} position={playerPosition}>
        {children}
    </sphere>;
};
