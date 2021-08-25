import { Vector3 } from '@babylonjs/core';
import { useRef } from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { useHands, useXRCamera } from './useXR';

export interface InternalRig {
    head: {
        position: Vector3;
        rotation: Vector3;
    };
    leftHand?: {
        position: Vector3 | undefined;
        rotation: Vector3;
    };
    rightHand?: {
        position: Vector3;
        rotation: Vector3;
    };
}

export const useRig: () => React.MutableRefObject<InternalRig | undefined> = () => {
    const xrCamera = useXRCamera();
    const hands = useHands();

    const rig = useRef<InternalRig>();

    useBeforeRender(() => {
        let position = new Vector3(0, 0, 0);
        if (xrCamera) {
            position = xrCamera.position;
        }

        let rotation = new Vector3(0, 0, 0);
        if (xrCamera) {
            rotation = xrCamera.rotationQuaternion.toEulerAngles();
        }

        rig.current = {
            head: {
                position,
                rotation,
            },
            leftHand: hands.left?.controller.grip
                ? {
                    position: hands.left.controller.grip.position,
                    rotation: hands.left.controller.grip.rotation,
                }
                : undefined,
            rightHand: hands.right?.controller.grip
                ? {
                    position: hands.right.controller.grip.position,
                    rotation: hands.right.controller.grip.rotation,
                }
                : undefined,
        };
    });

    return rig;
};
