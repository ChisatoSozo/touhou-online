import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { LS } from '../containers/LSContext';
import { StableTransformNode } from '../utils/ReactBabylonUtils';
import { THIRD_PERSON } from '../utils/Switches';
import { PLAYER_POSE_STORE } from './PlayerPoseStore';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PlayerCameraProps {
}

export const PlayerCamera: React.FC<PlayerCameraProps> = () => {

    return (
        <StableTransformNode name="cameraRootTransform" rotationQuaternion={PLAYER_POSE_STORE[LS.current.USERNAME].root.rotation} position={PLAYER_POSE_STORE[LS.current.USERNAME].root.position}>
            <StableTransformNode name="cameraTransform" rotationQuaternion={PLAYER_POSE_STORE[LS.current.USERNAME].head.rotation} position={PLAYER_POSE_STORE[LS.current.USERNAME].head.position}>
                <targetCamera fov={1.0472} name="camera" minZ={0.01} maxZ={10000} position={new Vector3(0, 0, THIRD_PERSON ? -5 : 0)} />
            </StableTransformNode>
        </StableTransformNode>
    );
};
