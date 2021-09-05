import { AnimationGroup, Skeleton } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { useMemo } from 'react';
import { Assets } from '../containers/AssetContext';
import { useAssets } from './useAssets';

interface Model {
    mesh: Mesh;
    animationGroups: AnimationGroup[] | undefined;
    animationSkeleton: Skeleton | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type useMultiModelsType = (modelNames: string[], childPaths: any[][], extractChild?: boolean) => Model[][] | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type useModelsType = (modelName: string, childPaths: any[], extractChild?: boolean) => Model[] | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type getModelsType = (assets: Assets, modelName: string, childPaths: any[], extractChild?: boolean) => Model[] | undefined;
type useModelType = (modelName: string, extractChild?: boolean) => Model | undefined;
type getModelType = (assets: Assets, modelName: string, extractChild?: boolean) => Model | undefined;

export const getModel: getModelType = (assets, modelName, extractChild = false) => {
    if (modelName in assets.containers) {
        const container = assets.containers[modelName];
        if (!container) return;
        const newInstance = container.instantiateModelsToScene();
        const mesh = (extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0]) as Mesh;

        mesh.parent = null;
        const animationGroups = newInstance.animationGroups;
        const animationSkeleton = newInstance.skeletons.length ? newInstance.skeletons[0] : undefined;

        return {
            mesh,
            animationGroups,
            animationSkeleton,
        };
    }
};

export const useModel: useModelType = (modelName, extractChild = false) => {
    const assets = useAssets();
    const model = useMemo(() => {
        if (modelName in assets.containers) {
            const container = assets.containers[modelName];
            if (!container) return;
            const newInstance = container.instantiateModelsToScene();
            const mesh = (extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0]) as Mesh;

            const animationGroups = newInstance.animationGroups;
            const animationSkeleton = newInstance.skeletons.length ? newInstance.skeletons[0] : undefined;

            return {
                mesh,
                animationGroups,
                animationSkeleton,
            };
        }
    }, [assets, extractChild, modelName]);

    return model;
};

[[0, 1]]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const procGetChildren = (childInstruction: any[], model: Mesh) => {
    const children = model.getChildren();
    const returnChildren: Model[] = [];
    childInstruction.forEach((instruction, i) => {
        if (Array.isArray(instruction)) {
            returnChildren.push(...procGetChildren(instruction, children[i] as Mesh))
        }
        else {
            const newInstance = children[instruction] as Mesh;
            returnChildren.push({
                mesh: newInstance,
                animationGroups: undefined,
                animationSkeleton: undefined
            })
        }
    })
    return returnChildren;
}

export const getModels: getModelsType = (assets, modelName, childPaths, extractChild = false) => {
    if (modelName in assets.containers) {
        const container = assets.containers[modelName];
        if (!container) return;
        const newInstance = container.instantiateModelsToScene();

        const mesh = (extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0]) as Mesh;

        const models = procGetChildren(childPaths, mesh);

        return models
    }
};

export const useModels: useModelsType = (modelName, childPaths, extractChild = false) => {
    const assets = useAssets();
    const model = useMemo(() => {
        if (modelName in assets.containers) {
            const container = assets.containers[modelName];
            if (!container) return;
            const newInstance = container.instantiateModelsToScene();

            const mesh = (extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0]) as Mesh;

            const models = procGetChildren(childPaths, mesh);

            return models
        }
    }, [assets.containers, childPaths, extractChild, modelName]);

    return model;
};

export const useMultiModels: useMultiModelsType = (modelNames, childPaths, extractChild = false) => {
    const assets = useAssets();
    const models = useMemo(() => {
        const outModels: Model[][] = [];
        modelNames.forEach((modelName, i) => {
            const model = getModels(assets, modelName, childPaths[i], extractChild);
            if (!model) return;
            outModels.push(model)
        });
        return outModels;
    }, [assets, childPaths, extractChild, modelNames]);

    return models;
}