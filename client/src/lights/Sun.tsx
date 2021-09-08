import { DirectionalLight, Vector3 } from '@babylonjs/core';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface IShadowContext {
    addShadowCaster: (mesh: AbstractMesh) => void;
}

export const ShadowContext = React.createContext<IShadowContext>({
    addShadowCaster: () => { return }
});

export const Sun: React.FC = ({ children }) => {

    const sunRef = useRef<DirectionalLight>();
    const [shadowGenerator, setShadowGenerator] = useState<ShadowGenerator>();
    const [newShadowCasters, setNewShadowCasters] = useState<AbstractMesh[]>([]);

    const addShadowCaster = useCallback((mesh: AbstractMesh) => {
        setNewShadowCasters(shadowCasters => [...shadowCasters, mesh]);
    }, [])

    useEffect(() => {
        if (!sunRef.current) return;

        const shadowGenerator = new ShadowGenerator(8192, sunRef.current);
        shadowGenerator.useBlurExponentialShadowMap = true
        setShadowGenerator(shadowGenerator);
    }, [])

    useEffect(() => {
        if (!shadowGenerator) return;
        newShadowCasters.forEach(shadowCaster => {
            shadowGenerator.addShadowCaster(shadowCaster)
        })
        if (newShadowCasters.length) setNewShadowCasters([])
    }, [newShadowCasters, shadowGenerator])

    return (
        <ShadowContext.Provider value={{ addShadowCaster }}>
            <directionalLight ref={sunRef} name="sun" intensity={0.7} direction={new Vector3(0, -1, -1)} position={new Vector3(0, 100, 100)}>
                {children}
            </directionalLight>
        </ShadowContext.Provider>
    )
}
