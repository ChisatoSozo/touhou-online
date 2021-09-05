
import React, { Dispatch, SetStateAction, useState } from 'react';
import { TerrainMesh } from '../terrain/TerrainMesh';

interface ITerrainContext {
    ground: TerrainMesh | undefined;
    setGround: Dispatch<SetStateAction<TerrainMesh | undefined>>;
}

export const TerrainContext = React.createContext<ITerrainContext>({
    ground: undefined,
    setGround: () => {
        return;
    }
});

export const useTerrainContext = () => {
    const [ground, setGround] = useState<TerrainMesh>();

    return { ground, setGround };
};
