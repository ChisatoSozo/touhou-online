import { WebXRAbstractMotionController, WebXRDefaultExperience, WebXRInputSource } from '@babylonjs/core';
import React, { useEffect, useState } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { keyObject } from './ControlsContext';

interface VRController {
    buttons: WebXRAbstractMotionController;
    controller: WebXRInputSource;
}

interface IXRContext {
    xr?: WebXRDefaultExperience;
    leftHand?: VRController;
    rightHand?: VRController;
}

export const XRContext = React.createContext<IXRContext>({});

export const useXRContext = (xrEnabled: boolean) => {
    const scene = useScene();
    const [xr, setXr] = useState<WebXRDefaultExperience>();
    const [leftHand, setLeftHand] = useState<VRController>();
    const [rightHand, setRightHand] = useState<VRController>();

    useEffect(() => {
        if (!xrEnabled) return;
        const createXR = async () => {
            if (!scene) return;

            const xrHelper = await scene.createDefaultXRExperienceAsync({
                disableTeleportation: true,
            });

            xrHelper.input.xrCamera.minZ = 0.01;

            xrHelper.input.onControllerAddedObservable.add((inputSource) => {
                inputSource.onMotionControllerInitObservable.add((motionController) => {
                    const xr_ids = motionController.getComponentIds();
                    if (!xr_ids.includes('xr-standard-thumbstick'))
                        throw new Error('xr-standard-thumbstick not supported by controller');
                    if (motionController.handedness == 'left') {
                        setLeftHand({ buttons: motionController, controller: inputSource });
                        return;
                    }
                    setRightHand({ buttons: motionController, controller: inputSource });
                });
            });

            xrHelper.pointerSelection.disableAutoAttach = true;
            setXr(xrHelper);
        };
        createXR();
    }, [scene, xrEnabled]);

    useBeforeRender(() => {
        if (!leftHand) return;
        const thumbstick = leftHand?.buttons.getComponent('xr-standard-thumbstick');
        if (thumbstick.axes.x < 1) keyObject.metaDownKeys['LEFT'] = -thumbstick.axes.x;
        if (thumbstick.axes.x > 1) keyObject.metaDownKeys['RIGHT'] = thumbstick.axes.x;
        if (thumbstick.axes.y < 1) keyObject.metaDownKeys['UP'] = -thumbstick.axes.y;
        if (thumbstick.axes.y > 1) keyObject.metaDownKeys['DOWN'] = thumbstick.axes.y;
    });

    return { xr, leftHand, rightHand };
};
