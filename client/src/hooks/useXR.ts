import { useContext } from 'react';
import { XRContext } from '../containers/XRContext';

export const useXR = () => {
    const { xr } = useContext(XRContext);
    return (xr?.input.controllers.length || 0) > 0 ? xr : undefined;
};

export const useHands = () => {
    const { leftHand, rightHand } = useContext(XRContext);
    return {
        left: leftHand,
        right: rightHand,
    };
};

export const useXRCamera = () => {
    const xr = useXR();
    if (!xr) return;
    return xr.input.xrCamera;
};
