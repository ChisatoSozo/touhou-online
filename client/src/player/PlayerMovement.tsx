import { Mesh, PhysicsImpostor, Quaternion, Scene, Vector3 } from '@babylonjs/core';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { LS } from '../containers/LSContext';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { useOctree } from '../hooks/useOctree';
import { ITerrainData, useTerrainData } from '../terrain/TerrainDataProvider';
import { LOG_DEPTH } from '../utils/Switches';
import { snapVecToHeightmap } from '../utils/WorldUtils';
import { MovementState } from './Player';
import { doFalling } from './playerMovement/Falling';
import { doFloating } from './playerMovement/Floating';
import { doFlying } from './playerMovement/Flying';
import { doWalking } from './playerMovement/Walking';
import { getPlayerPosition, PLAYER_POSE_STORE } from './PlayerPoseStore';

const playerPosition = new Vector3(0, 500, 0)

export const movementStateRef: MutableRefObject<MovementState> = {
    current: "walking"
}

export type MovementUpdateFunction = (deltaS: number, transform: Mesh, terrainData: ITerrainData, scene: Scene, createPhysics: () => PhysicsImpostor | undefined) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PlayerMovementProps {
}

export const PlayerMovement: React.FC<PlayerMovementProps> = () => {
    const [sphere, setSphere] = useState<Mesh>()
    const octree = useOctree();
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
        if (!sphere?.physicsImpostor) return;
        sphere.physicsImpostor.dispose()
        sphere.physicsImpostor = null;
        PLAYER_POSE_STORE[LS.current.USERNAME].head.position.y = 1.88;
    }, [sphere])

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
        if (!sphere) return

        const terrainPos = getPlayerPosition()
        snapVecToHeightmap(terrainData, terrainPos)
        if (getPlayerPosition().y < terrainPos.y && movementStateRef.current !== "walking") onCollision();

        switch (movementStateRef.current) {
            case "walking":
                doWalking(deltaS, sphere, terrainData, scene, createPhysics)
                break;
            case "falling":
                doFalling(deltaS, sphere, terrainData, scene, createPhysics)
                break;
            case "floating":
                doFloating(deltaS, sphere, terrainData, scene, createPhysics)
                break;
            case "flying":
                doFlying(deltaS, sphere, terrainData, scene, createPhysics)
                break;
            default:
                throw new Error("movement state not implemented: " + movementStateRef.current)
        }

        if (movementStateRef.current !== "flying") {
            sphere.rotationQuaternion = new Quaternion()
        }

        PLAYER_POSE_STORE[LS.current.USERNAME].root.position.copyFrom(sphere.getAbsolutePosition())
        if (movementStateRef.current === "flying") {
            sphere.rotationQuaternion?.copyFrom(PLAYER_POSE_STORE[LS.current.USERNAME].root.rotation)
        }
    });

    return <sphere isVisible={false} name="cameraPosition" diameter={0.5} segments={4} ref={(sphere: Mesh) => setSphere(sphere)} position={playerPosition}>
        <standardMaterial name="playerMat" useLogarithmicDepth={LOG_DEPTH} />
    </sphere>;
};
