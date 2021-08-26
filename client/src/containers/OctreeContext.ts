
import { AbstractMesh, Octree } from '@babylonjs/core';
import React, { useMemo } from 'react';
import { useScene } from 'react-babylonjs';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';

interface IOctreeContext {
    octree: Octree<AbstractMesh> | undefined;
}

export const OctreeContext = React.createContext<IOctreeContext>({
    octree: undefined,
});

export const useOctreeContext = () => {
    const scene = useScene()
    const octree = useMemo(() => scene?.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE), [scene])

    return { octree };
};
