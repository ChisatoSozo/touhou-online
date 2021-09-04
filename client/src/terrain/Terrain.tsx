import React from 'react';
import { TerrainGrassComponent } from './LODGrass';
import { TerrainMeshComponent } from './TerrainMesh';
import { Trees } from './Trees';

const mapSize = 5000
const heightScale = 400;



export const Terrain = () => {
    return <>
        <TerrainMeshComponent />
        <Trees mapSize={mapSize} heightScale={heightScale} />
        <TerrainGrassComponent />
    </>
};
