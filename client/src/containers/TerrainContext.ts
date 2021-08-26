
import { GroundMesh } from '@babylonjs/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { DynamicTerrain } from '../forks/DynamicTerrain';

interface ITerrainContext {
    terrain: DynamicTerrain | undefined;
    setTerrain: Dispatch<SetStateAction<DynamicTerrain | undefined>>;
    ground: GroundMesh | undefined;
    setGround: Dispatch<SetStateAction<GroundMesh | undefined>>;
}

export const TerrainContext = React.createContext<ITerrainContext>({
    terrain: undefined,
    setTerrain: () => {
        return;
    },
    ground: undefined,
    setGround: () => {
        return;
    }
});

export const useTerrainContext = () => {
    const [terrain, setTerrain] = useState<DynamicTerrain>()
    const [ground, setGround] = useState<GroundMesh>();

    return { terrain, setTerrain, ground, setGround };
};
