
import { AbstractMesh, Octree } from '@babylonjs/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { useScene } from 'react-babylonjs';
import { useOctree } from '../hooks/useOctree';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';

interface IOctreeContext {
    octree: Octree<AbstractMesh> | undefined;
}

export const OctreeContext = React.createContext<IOctreeContext>({
    octree: undefined,
});

export const useDynamicOctreeRef = (ref: React.MutableRefObject<AbstractMesh | undefined>) => {
    const octree = useOctree()
    const scene = useScene();
    useEffect(() => {
        if (!ref.current || !octree || !scene) return;
        const mesh = ref.current;
        octree.dynamicContent.push(mesh)
        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        return () => {
            octree.dynamicContent = octree.dynamicContent.filter(elem => elem !== mesh);
            scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        }
    }, [octree, ref, scene])
}

export const useNewDynamicOctreeRef = () => {
    const ref = useRef<AbstractMesh>()
    const octree = useOctree()
    const scene = useScene();
    useEffect(() => {
        if (!ref.current || !octree || !scene) return;
        const mesh = ref.current;
        octree.dynamicContent.push(mesh)
        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        return () => {
            octree.dynamicContent = octree.dynamicContent.filter(elem => elem !== mesh);
            scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        }
    }, [octree, scene])
    return ref
}

export const useOctreeContext = () => {
    const scene = useScene()
    const octree = useMemo(() => scene?.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE), [scene])

    return { octree };
};
