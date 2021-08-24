import { Quaternion, Vector3 } from '@babylonjs/core';
import React from 'react';
import { keyObject } from '../containers/ControlsContext';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { useXRCamera } from '../hooks/useXR';
import { LATERAL_SPEED, SPIN_SPEED } from '../utils/Constants';
import { CREATIVE } from '../utils/Switches';

export const playerPositionOffset = new Vector3(0, 50, 0);
export const playerRotationOffset = new Vector3();

export const PlayerMovement: React.FC = () => {
    const xrCamera = useXRCamera();

    useDeltaBeforeRender((scene, deltaS) => {
        const FORWARD = keyObject.metaDownKeys['FORWARD'];
        const BACK = keyObject.metaDownKeys['BACK'];
        const LEFT = keyObject.metaDownKeys['LEFT'];
        const RIGHT = keyObject.metaDownKeys['RIGHT'];
        const SLOW = keyObject.metaDownKeys['SLOW'];
        const UP = keyObject.metaDownKeys['UP'];
        const DOWN = keyObject.metaDownKeys['DOWN'];

        let forwardVec = Vector3.Zero();

        if (xrCamera) {
            forwardVec = xrCamera.getForwardRay().direction;
            forwardVec.y = 0;
        } else {
            const vec = new Vector3(0, 0, 1);
            const quat = Quaternion.FromEulerAngles(playerRotationOffset.x, playerRotationOffset.y, playerRotationOffset.z);
            forwardVec = Vector3.Zero();
            vec.rotateByQuaternionToRef(quat, forwardVec);
        }

        const slowFactor = SLOW ? 0.5 : 1;

        if (xrCamera) {
            if (FORWARD) xrCamera.position.addInPlace(Vector3.Forward().scale(deltaS * LATERAL_SPEED * slowFactor * +FORWARD));
            if (BACK) xrCamera.position.addInPlace(Vector3.Backward().scale(deltaS * LATERAL_SPEED * slowFactor * +BACK));
            if (LEFT) xrCamera.position.addInPlace(Vector3.Left().scale(deltaS * LATERAL_SPEED * slowFactor * +LEFT));
            if (RIGHT) xrCamera.position.addInPlace(Vector3.Right().scale(deltaS * LATERAL_SPEED * slowFactor * +RIGHT));
        } else {
            if (FORWARD) playerPositionOffset.addInPlace(forwardVec.scale(deltaS * LATERAL_SPEED * slowFactor * +FORWARD));
            if (BACK) playerPositionOffset.addInPlace(forwardVec.scale(-deltaS * LATERAL_SPEED * slowFactor * +BACK));
            if (LEFT) playerRotationOffset.addInPlace(Vector3.Up().scale(-deltaS * SPIN_SPEED * slowFactor * +LEFT));
            if (RIGHT) playerRotationOffset.addInPlace(Vector3.Up().scale(deltaS * SPIN_SPEED * slowFactor * +RIGHT));
            if (CREATIVE) {
                if (UP) playerPositionOffset.addInPlace(Vector3.Up().scale(-deltaS * LATERAL_SPEED * slowFactor * +UP));
                if (DOWN) playerPositionOffset.addInPlace(Vector3.Up().scale(deltaS * LATERAL_SPEED * slowFactor * +DOWN));
            }
        }
    });

    return null;
};
