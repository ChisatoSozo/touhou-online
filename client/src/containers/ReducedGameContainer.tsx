import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { AssetContext, useAssetContext } from './AssetContext';
import { BulletContext, useBulletContext } from './BulletContext';
import { EffectContext, useEffectContext } from './EffectContext';
import { assetPaths } from './GameContainer';
import { GlowContext, useGlowContext } from './GlowContext';

export const ReducedGameContainer: React.FC = ({ children }) => {

    const assets = useAssetContext(assetPaths);
    const effects = useEffectContext(assets.assets);
    const glow = useGlowContext()
    const bullets = useBulletContext(assets, effects, glow.glowLayer, new Vector3(0, 0, 0))

    return (

        <AssetContext.Provider value={assets}>
            <EffectContext.Provider value={effects}>
                <GlowContext.Provider value={glow}>
                    <BulletContext.Provider value={bullets}>
                        {children}
                    </BulletContext.Provider>
                </GlowContext.Provider>
            </EffectContext.Provider>
        </AssetContext.Provider>
    );
};
