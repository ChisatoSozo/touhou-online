import { Matrix, Quaternion, TransformNode, Vector3 } from '@babylonjs/core';
import React, { MutableRefObject } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { keyObject } from '../containers/ControlsContext';
import { THIRD_PERSON } from '../utils/Switches';
import { username } from '../utils/TempConst';
import { movementStateRef } from './PlayerMovement';
import { PLAYER_POSE_STORE } from './PlayerPoseStore';

const cameraPosition = new Vector3(0, 1.88, 0);

interface PlayerCameraProps {
    head: MutableRefObject<TransformNode | undefined>
}

export const PlayerCamera: React.FC<PlayerCameraProps> = ({ head }) => {

    const scene = useScene()

    useBeforeRender(() => {
        if (!head.current) return;
        if (movementStateRef.current === "flying") return;

        const upM = Matrix.RotationX((0.99 * keyObject.metaDownKeys.lookY) * Math.PI / 2);
        const rightM = Matrix.RotationY(keyObject.metaDownKeys.lookX * Math.PI);
        const _rightM = Matrix.RotationY(keyObject.metaDownKeys.lookX * Math.PI + Math.PI);

        const matrix = Matrix.Identity().multiply(upM).multiply(rightM);

        const _ = new Vector3();
        const rotation = new Quaternion();

        matrix.decompose(_, rotation);

        head.current.rotationQuaternion = rotation;

        PLAYER_POSE_STORE[username].root.rotation.copyFrom(Quaternion.FromRotationMatrix(_rightM))
    });

    return (
        <>
            <transformNode name="cameraTransform" ref={head} position={cameraPosition}>
                <targetCamera fov={1.0472} name="camera" minZ={0.01} maxZ={10000} position={new Vector3(0, 0, THIRD_PERSON ? -5 : 0)} />
            </transformNode>
        </>
    );
};
