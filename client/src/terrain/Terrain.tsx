import { Mesh } from '@babylonjs/core/Meshes/mesh';
import React, { useRef } from 'react';
import { SkyBox } from './SkyBox';

export const mapSize = 8000
export const heightScale = 640;



export const Terrain = () => {
    const skyBoxRef = useRef<Mesh>()

    return <>
        {/* <TerrainMeshComponent /> */}
        {/* <Trees mapSize={mapSize} heightScale={heightScale} />
        <TerrainGrassComponent /> */}
        {/* <Water skyBoxRef={skyBoxRef} y={heightScale * .337} /> */}
        <SkyBox skyBoxRef={skyBoxRef} />
    </>
};
