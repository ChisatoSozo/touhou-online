
import React, { Dispatch, SetStateAction, useState } from 'react';
import { DynamicTerrain } from '../forks/DynamicTerrain';
import { TerrainMesh } from '../terrain/TerrainMesh';

interface ITerrainContext {
    terrain: DynamicTerrain | undefined;
    setTerrain: Dispatch<SetStateAction<DynamicTerrain | undefined>>;
    ground: TerrainMesh | undefined;
    setGround: Dispatch<SetStateAction<TerrainMesh | undefined>>;
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
    const [ground, setGround] = useState<TerrainMesh>();

    return { terrain, setTerrain, ground, setGround };
};
