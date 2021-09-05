import { Mesh } from '@babylonjs/core/Meshes/mesh';
import React, { useRef } from 'react';
import { TerrainGrassComponent } from './LODGrass';
import { SkyBox } from './SkyBox';
import { TerrainMeshComponent } from './TerrainMesh';
import { Trees } from './Trees';
import { Water } from './Water';

const mapSize = 10000
const heightScale = 800;



export const Terrain = () => {
    const skyBoxRef = useRef<Mesh>()

    return <>
        <TerrainMeshComponent />
        <Trees mapSize={mapSize} heightScale={heightScale} />
        <TerrainGrassComponent />
        <Water skyBoxRef={skyBoxRef} y={heightScale * .337} />
        <SkyBox skyBoxRef={skyBoxRef} />
    </>
};
