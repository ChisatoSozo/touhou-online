import React from 'react';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { useXRContext, XRContext } from './XRContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GameContainerProps {
    xrEnabled: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({ children, xrEnabled }) => {
    const controls = useControlsContext(false);
    const xr = useXRContext(xrEnabled);

    return (
        <ControlsContext.Provider value={controls}>
            <XRContext.Provider value={xr}>{children}</XRContext.Provider>
        </ControlsContext.Provider>
    );
};
