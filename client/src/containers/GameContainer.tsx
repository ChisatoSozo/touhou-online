import React from 'react';
import { heightScale, mapSize } from '../terrain/Terrain';
import { TerrainDataProvider } from '../terrain/TerrainDataProvider';
import { AssetContext, useAssetContext } from './AssetContext';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { OctreeContext, useOctreeContext } from './OctreeContext';
import { TerrainContext, useTerrainContext } from './TerrainContext';
import { useXRContext, XRContext } from './XRContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GameContainerProps {
    xrEnabled: boolean;
}

const assetPaths = [
    "/assets/trees/Tree_1.glb",
    "/assets/trees/Tree_2.glb",
    "/assets/trees/Tree_3.glb",
    "/assets/foliage/grass.glb",

    "/assets/avatars/Reimu.glb"
]

export const GameContainer: React.FC<GameContainerProps> = ({ children, xrEnabled }) => {
    const controls = useControlsContext(false);
    const xr = useXRContext(xrEnabled);
    const terrain = useTerrainContext();
    const octree = useOctreeContext();
    const assets = useAssetContext(assetPaths);

    return (
        <ControlsContext.Provider value={controls}>
            <XRContext.Provider value={xr}>
                <TerrainContext.Provider value={terrain}>
                    <OctreeContext.Provider value={octree}>
                        <AssetContext.Provider value={assets}>
                            <TerrainDataProvider heightmapEndpoint={`http://${window.location.hostname}:5000/terrain`} size={mapSize} height={heightScale}>
                                {children}
                            </TerrainDataProvider>
                        </AssetContext.Provider>
                    </OctreeContext.Provider>
                </TerrainContext.Provider>
            </XRContext.Provider>
        </ControlsContext.Provider>
    );
};
