import { Mesh, PhysicsImpostor, Quaternion, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import React, { MutableRefObject, useCallback, useContext, useEffect, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { OctreeContext } from '../containers/OctreeContext';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { ITerrainData, useTerrainData } from '../terrain/TerrainDataProvider';
import { LOG_DEPTH } from '../utils/Switches';
import { snapVecToHeightmap } from '../utils/WorldUtils';
import { MovementState } from './Player';
import { doFalling } from './playerMovement/Falling';
import { doFloating } from './playerMovement/Floating';
import { doFlying } from './playerMovement/Flying';
import { doWalking } from './playerMovement/Walking';

const playerPosition = new Vector3(0, 500, 0)

export const movementStateRef: MutableRefObject<MovementState> = {
    current: "walking"
}

export type MovementUpdateFunction = (deltaS: number, transform: Mesh, terrainData: ITerrainData, head: TransformNode, scene: Scene, createPhysics: () => PhysicsImpostor | undefined) => void;

interface PlayerMovementProps {
    head: MutableRefObject<TransformNode | undefined>
}

export const PlayerMovement: React.FC<PlayerMovementProps> = ({ head, children }) => {
    const [sphere, setSphere] = useState<Mesh>()
    const { octree } = useContext(OctreeContext)
    const terrainData = useTerrainData()
    const scene = useScene()
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

    const onCollision = useCallback(() => {
        movementStateRef.current = "walking";
        if (!sphere?.physicsImpostor || !head.current) return;
        sphere.physicsImpostor.dispose()
        sphere.physicsImpostor = null;
        head.current.position = new Vector3(0, 1.88, 0);
    }, [head, sphere])

    const createPhysics = useCallback(() => {
        if (!sphere || !scene) return;
        const newPhysicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9,
            friction: 1,
        })
        // newPhysicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor as PhysicsImpostor, onCollision)
        newPhysicsImpostor.physicsBody.angularDamping = 1;
        return newPhysicsImpostor
    }, [sphere, scene])

    useDeltaBeforeRender((scene, deltaS) => {
        if (!sphere || !head.current) return

        const feetPos = sphere.position.subtract(new Vector3(0, 0.5, 0));
        const terrainPos = feetPos.clone()
        snapVecToHeightmap(terrainData, terrainPos)
        if (feetPos.y < terrainPos.y && movementStateRef.current !== "walking") onCollision();

        switch (movementStateRef.current) {
            case "walking":
                doWalking(deltaS, sphere, terrainData, head.current, scene, createPhysics)
                break;
            case "falling":
                doFalling(deltaS, sphere, terrainData, head.current, scene, createPhysics)
                break;
            case "floating":
                doFloating(deltaS, sphere, terrainData, head.current, scene, createPhysics)
                break;
            case "flying":
                doFlying(deltaS, sphere, terrainData, head.current, scene, createPhysics)
                break;
            default:
                throw new Error("movement state not implemented: " + movementStateRef.current)
        }

        if (movementStateRef.current !== "flying") {
            sphere.rotationQuaternion = new Quaternion()
        }

    });

    return <sphere isVisible={false} name="cameraPosition" diameter={0.5} segments={4} ref={(sphere: Mesh) => setSphere(sphere)} position={playerPosition}>
        <standardMaterial name="playerMat" useLogarithmicDepth={LOG_DEPTH} />
        {children}
    </sphere>;
};
