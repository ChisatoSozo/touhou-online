import React from 'react';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { TerrainContext, useTerrainContext } from './TerrainContext';
import { useXRContext, XRContext } from './XRContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GameContainerProps {
    xrEnabled: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({ children, xrEnabled }) => {
    const controls = useControlsContext(false);
    const xr = useXRContext(xrEnabled);
    const terrain = useTerrainContext();

    return (
        <ControlsContext.Provider value={controls}>
            <XRContext.Provider value={xr}>
                <TerrainContext.Provider value={terrain}>
                    {children}
                </TerrainContext.Provider>
            </XRContext.Provider>
        </ControlsContext.Provider>
    );
};
