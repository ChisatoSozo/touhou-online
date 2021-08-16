import { Matrix, Quaternion, TransformNode, Vector3 } from '@babylonjs/core';
import React, { useCallback, useEffect, useRef } from 'react';
import { useBeforeRender, useEngine } from 'react-babylonjs';
import { playerPositionOffset, playerRotationOffset } from './PlayerMovement';

export const PlayerCamera = () => {
    const engine = useEngine();
    const canvas = engine?.getRenderingCanvas();
    const cameraRef = useRef();
    const transformNodeRef = useRef<TransformNode>();

    const cameraHandler = useCallback((e) => {
        if (!cameraRef.current) return;
        const x = e.offsetX;
        const y = e.offsetY;
        const width = e.target.offsetWidth;
        const height = e.target.offsetHeight;

        const right = x / width - 0.5;
        const up = y / height - 0.5;

        const upM = Matrix.RotationX(Math.PI * up);
        const rightM = Matrix.RotationY(Math.PI * right);

        const matrix = Matrix.Identity().multiply(upM).multiply(rightM);

        const _ = new Vector3();
        const rotation = new Quaternion();

        matrix.decompose(_, rotation);

        //@ts-ignore
        cameraRef.current.rotationQuaternion = rotation;
    }, []);

    useEffect(() => {
        if (!canvas) return;
        canvas.addEventListener('pointermove', cameraHandler);

        return () => {
            canvas.removeEventListener('pointermove', cameraHandler);
        };
    }, [canvas, cameraHandler]);

    useBeforeRender(() => {
        if (!transformNodeRef.current) return;
        transformNodeRef.current.position.copyFrom(playerPositionOffset.add(new Vector3(0, 1.88, 0)));
        transformNodeRef.current.rotationQuaternion = Quaternion.FromEulerAngles(
            playerRotationOffset.x,
            playerRotationOffset.y,
            playerRotationOffset.z,
        );
    });

    return (
        <transformNode name="cameraTransform" ref={transformNodeRef} position={new Vector3(0, 1.88, 0)}>
            <targetCamera fov={1.0472} ref={cameraRef} name="camera" minZ={0.01} maxZ={100} position={new Vector3(0, 0, 0)} />
        </transformNode>
    );
};
