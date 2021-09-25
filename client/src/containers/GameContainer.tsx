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

export const assetPaths = [

    `${process.env.PUBLIC_URL}/assets/trees/Tree_1.glb`,
    `${process.env.PUBLIC_URL}/assets/trees/Tree_2.glb`,
    `${process.env.PUBLIC_URL}/assets/trees/Tree_3.glb`,
    `${process.env.PUBLIC_URL}/assets/foliage/grass.glb`,

    `${process.env.PUBLIC_URL}/assets/avatars/Reimu.glb`,

    'sphere.function',
    `${process.env.PUBLIC_URL}/assets/bullets/laser.glb`, //laser
    `${process.env.PUBLIC_URL}/assets/bullets/test.glb`, //test

    `${process.env.PUBLIC_URL}/assets/particles/hitParticles.particles`, //hit particles

    `${process.env.PUBLIC_URL}/assets/sfx/enemyShoot.wav`
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
                            <TerrainDataProvider heightmapEndpoint={`http://${window.location.hostname}:5000`} size={mapSize} height={heightScale}>
                                {children}
                            </TerrainDataProvider>
                        </AssetContext.Provider>
                    </OctreeContext.Provider>
                </TerrainContext.Provider>
            </XRContext.Provider>
        </ControlsContext.Provider>
    );
};
