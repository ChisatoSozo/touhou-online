import { Mesh, PhysicsImpostor, Quaternion, Scene, Vector3 } from '@babylonjs/core';
import React, { Dispatch, SetStateAction, useCallback, useContext, useRef, useState } from 'react';
import { TerrainContext } from '../containers/TerrainContext';
import { DynamicTerrain } from '../forks/DynamicTerrain';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { useXRCamera } from '../hooks/useXR';
import { ENABLE_PHYSICS } from '../utils/Switches';
import { doWalking } from './playerMovement/Walking';

const playerPosition = new Vector3(0, 50, 0)

export type MovementState = "walking" | "falling" | "flying";
export type MovementUpdateFunction = (deltaS: number, transform: Mesh, terrain: DynamicTerrain | undefined, scene: Scene, setMovementState: Dispatch<SetStateAction<MovementState>>, createPhysics: () => PhysicsImpostor | undefined) => void;

export const PlayerMovement: React.FC = ({ children }) => {
    const xrCamera = useXRCamera();
    const sphereRef = useRef<Mesh>()

    const [movementState, setMovementState] = useState<MovementState>("walking")

    const { terrain, terrainPhysicsImpostor } = useContext(TerrainContext)

    const onCollision = useCallback(() => {
        setMovementState("walking")
        if (!sphereRef.current?.physicsImpostor) return;
        sphereRef.current.physicsImpostor.dispose()
        sphereRef.current.physicsImpostor = null;
    }, [])

    const createPhysics = useCallback(() => {
        if (!sphereRef.current || !terrainPhysicsImpostor || !ENABLE_PHYSICS) return;
        const newPhysicsImpostor = new PhysicsImpostor(sphereRef.current, PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9,
            friction: 1,
        })
        newPhysicsImpostor.registerOnPhysicsCollide(terrainPhysicsImpostor, onCollision)
        return newPhysicsImpostor
    }, [onCollision, terrainPhysicsImpostor])

    useDeltaBeforeRender((scene, deltaS) => {
        if (!sphereRef.current) return
        switch (movementState) {
            case "walking":
                doWalking(deltaS, sphereRef.current, terrain, scene, setMovementState, createPhysics)
                break;
            case "falling":
                break;
            default:
                throw new Error("movement state not implemented: " + movementState)
        }
        // const FORWARD = keyObject.metaDownKeys['FORWARD'];
        // const BACK = keyObject.metaDownKeys['BACK'];
        // const LEFT = keyObject.metaDownKeys['LEFT'];
        // const RIGHT = keyObject.metaDownKeys['RIGHT'];
        // const UP = keyObject.metaDownKeys['JUMP'];
        // const DOWN = keyObject.metaDownKeys['CROUCH'];

        // let forwardVec = Vector3.Zero();

        // if (xrCamera) {
        //     forwardVec = xrCamera.getForwardRay().direction;
        //     forwardVec.y = 0;
        // } else {
        //     if (!scene.activeCamera) return
        //     forwardVec = scene.activeCamera.getForwardRay().direction
        //     forwardVec.y = 0;

        // }

        // forwardVec.normalize()
        // const rightVec = forwardVec.cross(Vector3.Up()).scale(-1)

        // const applyDirection = (delta: Vector3) => {
        //     if (!sphereRef.current) return;
        //     if (ENABLE_PHYSICS) {
        //         if (!playerPhysicsRef.current) return;
        //         playerPhysicsRef.current.applyForce(delta.scale(10), sphereRef.current.getAbsolutePosition())
        //     }
        //     else {
        //         sphereRef.current.position.addInPlace(delta)
        //     }
        // }

        // if (xrCamera) {
        //     if (FORWARD) xrCamera.position.addInPlace(Vector3.Forward().scale(deltaS * LATERAL_SPEED * +FORWARD));
        //     if (BACK) xrCamera.position.addInPlace(Vector3.Backward().scale(deltaS * LATERAL_SPEED * +BACK));
        //     if (LEFT) xrCamera.position.addInPlace(Vector3.Left().scale(deltaS * LATERAL_SPEED * +LEFT));
        //     if (RIGHT) xrCamera.position.addInPlace(Vector3.Right().scale(deltaS * LATERAL_SPEED * +RIGHT));
        // } else {

        //     if (FORWARD) applyDirection(forwardVec.scale(deltaS * LATERAL_SPEED * +FORWARD))
        //     if (BACK) applyDirection(forwardVec.scale(-deltaS * LATERAL_SPEED * +BACK));
        //     if (LEFT) applyDirection(rightVec.scale(-deltaS * LATERAL_SPEED * +LEFT));
        //     if (RIGHT) applyDirection(rightVec.scale(deltaS * LATERAL_SPEED * +RIGHT));
        //     if (CREATIVE) {
        //         if (UP) applyDirection(Vector3.Up().scale(deltaS * LATERAL_SPEED * +UP));
        //         if (DOWN) applyDirection(Vector3.Up().scale(-deltaS * LATERAL_SPEED * +DOWN));
        //     }
        // }

        sphereRef.current.rotationQuaternion = new Quaternion()
    });

    return <sphere name="cameraPosition" diameter={0.5} segments={4} ref={sphereRef} position={playerPosition}>
        {children}
    </sphere>;
};
