import { useCallback, useContext, useEffect } from 'react';
import { useEngine } from 'react-babylonjs';
import { ControlsContext } from '../containers/ControlsContext';

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

    return null;
};
