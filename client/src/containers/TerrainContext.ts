
import { PhysicsImpostor } from '@babylonjs/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { DynamicTerrain } from '../forks/DynamicTerrain';

interface ITerrainContext {
    terrain: DynamicTerrain | undefined;
    setTerrain: Dispatch<SetStateAction<DynamicTerrain | undefined>>;
    terrainPhysicsImpostor: PhysicsImpostor | undefined;
    setTerrainPhysicsImpostor: Dispatch<SetStateAction<PhysicsImpostor | undefined>>;
}

export const TerrainContext = React.createContext<ITerrainContext>({
    terrain: undefined,
    setTerrain: () => {
        return;
    },
    terrainPhysicsImpostor: undefined,
    setTerrainPhysicsImpostor: () => {
        return;
    }
});

export const useTerrainContext = () => {
    const [terrain, setTerrain] = useState<DynamicTerrain>()
    const [terrainPhysicsImpostor, setTerrainPhysicsImpostor] = useState<PhysicsImpostor>()

    return { terrain, setTerrain, terrainPhysicsImpostor, setTerrainPhysicsImpostor };
};
