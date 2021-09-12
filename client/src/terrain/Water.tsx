import { Mesh, Texture, Vector2 } from '@babylonjs/core'
import React, { MutableRefObject, useContext, useEffect, useRef } from 'react'
import { useScene } from 'react-babylonjs'
import { TerrainContext } from '../containers/TerrainContext'
import { WaterMaterial } from '../forks/WaterMaterial'
import { LOG_DEPTH } from '../utils/Switches'

interface WaterProps {
    skyBoxRef: MutableRefObject<Mesh | undefined>
    y: number;
}

export const Water: React.FC<WaterProps> = ({ skyBoxRef, y }) => {
    const scene = useScene()
    const groundRef = useRef<Mesh>()
    const { ground } = useContext(TerrainContext)

    useEffect(() => {
        if (!groundRef.current || !scene || !ground || !skyBoxRef.current) return;


        const water = new WaterMaterial("water", scene, new Vector2(1024, 1024));
        groundRef.current.material = water;
        water.backFaceCulling = true;
        const bumpTexture = new Texture("/terrain/waterbump.png", scene);
        bumpTexture.uScale = 50.;
        bumpTexture.vScale = 50.;
        water.bumpTexture = bumpTexture
        water.windForce = -.01;
        water.waveHeight = 0;
        water.bumpHeight = 1;
        water.waveLength = .3;
        water.colorBlendFactor = 0;
        water.useLogarithmicDepth = LOG_DEPTH
        water.disableClipPlane = false;
        water.addToRenderList(ground);
        water.addToRenderList(skyBoxRef.current)
    }, [ground, scene, skyBoxRef]);

    return (
        <ground position-y={y} ref={groundRef} width={10000} height={10000} name="ground" />
    )
}
