import { Matrix } from '@babylonjs/core';
import { Quaternion } from '@babylonjs/core/Maths/math.vector';
import { useCallback, useContext, useEffect } from 'react';
import { useBeforeRender, useEngine } from 'react-babylonjs';
import { ControlsContext, keyObject } from '../containers/ControlsContext';
import { username } from '../utils/TempConst';
import { movementStateRef } from './PlayerMovement';
import { PLAYER_POSE_STORE } from './PlayerPoseStore';

export const BindControls = () => {
    const engine = useEngine();
    const { keyDownHandler, keyUpHandler, lookMoveHandler } = useContext(ControlsContext);

    const lockChange = useCallback(() => {
        const canvas = engine?.getRenderingCanvas();
        if (!canvas) return;
        if (document.pointerLockElement === canvas) {
            document.addEventListener("pointermove", lookMoveHandler, false);
        }
        else {
            document.removeEventListener("pointermove", lookMoveHandler, false);
        }
    }, [engine, lookMoveHandler])

    const capturePointer = useCallback(() => {
        const canvas = engine?.getRenderingCanvas();
        if (!canvas) return;
        if (document.pointerLockElement === canvas) return;
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
        canvas.requestPointerLock();
        document.addEventListener('pointerlockchange', lockChange, false);
        document.addEventListener('mozpointerlockchange', lockChange, false);
    }, [engine, lockChange])

    useEffect(() => {
        const canvas = engine?.getRenderingCanvas();
        if (!canvas) return;

        canvas.addEventListener('keyup', keyUpHandler);
        canvas.addEventListener('keydown', keyDownHandler);
        canvas.addEventListener('pointerup', keyUpHandler);
        canvas.addEventListener('pointerdown', keyDownHandler);
        canvas.addEventListener('pointerdown', capturePointer);

        return () => {
            canvas.removeEventListener('keyup', keyUpHandler);
            canvas.removeEventListener('keydown', keyDownHandler);
            canvas.removeEventListener('pointerup', keyUpHandler);
            canvas.removeEventListener('pointerdown', keyDownHandler);
            canvas.removeEventListener('pointerdown', capturePointer);
        };
    }, [capturePointer, engine, keyDownHandler, keyUpHandler]);

    useBeforeRender(() => {
        if (movementStateRef.current === "flying") return;

        const upM = Matrix.RotationX((0.99 * keyObject.metaDownKeys.lookY) * Math.PI / 2);
        const rightM = Matrix.RotationY(keyObject.metaDownKeys.lookX * Math.PI);

        PLAYER_POSE_STORE[username.current].head.rotation.copyFrom(Quaternion.FromRotationMatrix(upM));
        PLAYER_POSE_STORE[username.current].root.rotation.copyFrom(Quaternion.FromRotationMatrix(rightM))
    }, undefined, true);

    return null;
};
