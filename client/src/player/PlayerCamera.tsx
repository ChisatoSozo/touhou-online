import { Matrix, Quaternion, TransformNode, Vector3 } from '@babylonjs/core';
import React, { MutableRefObject } from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { keyObject } from '../containers/ControlsContext';
import { movementStateRef } from './PlayerMovement';

const cameraPosition = new Vector3(0, 1.88, 0);

interface PlayerCameraProps {
    head: MutableRefObject<TransformNode | undefined>
}

export const PlayerCamera: React.FC<PlayerCameraProps> = ({ head }) => {

    useBeforeRender(() => {
        if (!head.current) return;
        if (movementStateRef.current === "flying") return;

        const upM = Matrix.RotationX(keyObject.metaDownKeys.lookY * Math.PI / 2);
        const rightM = Matrix.RotationY(keyObject.metaDownKeys.lookX * Math.PI);

        const matrix = Matrix.Identity().multiply(upM).multiply(rightM);

        const _ = new Vector3();
        const rotation = new Quaternion();

        matrix.decompose(_, rotation);

        head.current.rotationQuaternion = rotation;
    });

    return (
        <>
            <transformNode name="cameraTransform" ref={head} position={cameraPosition}>
                <targetCamera fov={1.0472} name="camera" minZ={0.01} maxZ={10000} position={new Vector3(0, 0, 0)} />
            </transformNode>
        </>
    );
};
