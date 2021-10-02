import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { AssetContext, useAssetContext } from './AssetContext';
import { BulletContext, useBulletContext } from './BulletContext';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { EffectContext, useEffectContext } from './EffectContext';
import { GlowContext, useGlowContext } from './GlowContext';
import { OctreeContext, useOctreeContext } from './OctreeContext';
import { TerrainContext, useTerrainContext } from './TerrainContext';
import { useXRContext, XRContext } from './XRContext';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GameContainerProps {
    xrEnabled: boolean;
}

export const assetPaths = [
    `https://${window.location.hostname}:5000/terrain.terrain`,

    `${process.env.PUBLIC_URL}/assets/trees/Tree_1.glb`,
    `${process.env.PUBLIC_URL}/assets/trees/Tree_2.glb`,
    `${process.env.PUBLIC_URL}/assets/trees/Tree_3.glb`,
    `${process.env.PUBLIC_URL}/assets/foliage/grass.glb`,

    `${process.env.PUBLIC_URL}/assets/avatars/Reimu.glb`,
    `${process.env.PUBLIC_URL}/assets/avatars/Marisa.glb`,

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
    const effects = useEffectContext(assets.assets);
    const glow = useGlowContext()
    const bullets = useBulletContext(assets, effects, glow.glowLayer, new Vector3(0, 0, 0), octree.octree)

    return (
        <ControlsContext.Provider value={controls}>
            <XRContext.Provider value={xr}>
                <TerrainContext.Provider value={terrain}>
                    <OctreeContext.Provider value={octree}>
                        <AssetContext.Provider value={assets}>
                            <EffectContext.Provider value={effects}>
                                <GlowContext.Provider value={glow}>
                                    <BulletContext.Provider value={bullets}>
                                        {children}
                                    </BulletContext.Provider>
                                </GlowContext.Provider>
                            </EffectContext.Provider>
                        </AssetContext.Provider>
                    </OctreeContext.Provider>
                </TerrainContext.Provider>
            </XRContext.Provider>
        </ControlsContext.Provider>
    );
};
