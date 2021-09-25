import {
    AbstractAssetTask,
    AssetContainer,
    BinaryFileAssetTask,
    ContainerAssetTask, Mesh, MeshBuilder, ParticleSystem,
    Scene,
    Sound,
    Texture,
    TextureAssetTask
} from '@babylonjs/core';
import parsePath from 'parse-filepath';
import React, { useEffect, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { CustomAssetsManager, ParticlesAssetTask } from '../forks/CustomAssetManager';
import { QualityName } from '../utils/Constants';
import { LS } from './LSContext';

export interface Assets {
    containers: {
        [key: string]: AssetContainer | undefined;
    };
    textures: {
        [key: string]: Texture | undefined;
    };
    meshes: {
        [key: string]: Mesh | undefined;
    };
    particles: {
        [key: string]: ParticleSystem | undefined;
    };
    sounds: {
        [key: string]: Sound | undefined;
    }
}
export interface IAssetContext {
    assets: Assets;
    assetsLoaded: boolean;
}

const defaultAssetContext: () => IAssetContext = () => ({
    assets: {
        containers: {},
        textures: {},
        meshes: {},
        particles: {},
        sounds: {},
    },
    assetsLoaded: false,
});

export const AssetContext = React.createContext<IAssetContext>(defaultAssetContext());

const qualityMap: {
    [key in QualityName]: {
        segments: number;
    };
} = {
    Hi: { segments: 10 },
    Med: { segments: 6 },
    Low: { segments: 3 },
};

const assetFunctions: { [key: string]: (scene: Scene) => Mesh } = {
    sphere: (scene) => {
        const mesh = MeshBuilder.CreateSphere(
            'sphere',
            {
                diameter: 2,
                segments: qualityMap[LS.current.QUALITY].segments || 10,
                updatable: false,
            },
            scene,
        );

        mesh.isVisible = false;
        return mesh;
    },
};

const loadAssets = async (scene: Scene, assetPaths: string[]) => {

    return new Promise<Assets>((resolve, reject) => {
        const assetsManager = new CustomAssetsManager(scene);

        const loadedMeshes: { [key: string]: Mesh } = {};

        assetPaths.forEach((path) => {
            let assetTask: AbstractAssetTask;

            const parsedPath = parsePath(path);
            const extension = parsedPath.ext;
            const base = parsedPath.base;
            const directory = parsedPath.dir;
            const name = parsedPath.name;

            switch (extension) {
                case '.png':
                case '.jpg':
                    assetTask = assetsManager.addTextureTask(name, path);
                    assetTask.onSuccess = (task) => {
                        task.texture.hasAlpha = true;
                    };
                    assetTask.onError = console.error;
                    break;
                case '.glb':
                case '.gltf':
                    assetTask = assetsManager.addContainerTask(name, '', directory + '/', base);
                    assetTask.onError = console.error;
                    break;
                case '.function':
                    loadedMeshes[name] = assetFunctions[name](scene);
                    break;
                case '.particles':
                    assetTask = assetsManager.addParticlesTask(name, directory + '/');
                    assetTask.onError = console.error;
                    break;
                case '.wav':
                case '.mp3':
                    assetTask = assetsManager.addBinaryFileTask(name, path);
                    assetTask.onError = console.error;
                    break;
                default:
                    reject(`Unknown asset extension ${extension}`);
            }
        });

        assetsManager.onFinish = (tasks) => {
            const assets = defaultAssetContext().assets;

            tasks.forEach((task) => {
                if (task instanceof TextureAssetTask) {
                    if (task.name in assets.textures) reject(`Duplicate texture name ${task.name}`);
                    assets.textures[task.name] = task.texture;
                    return;
                }
                if (task instanceof ContainerAssetTask) {
                    if (task.name in assets.containers) reject(`Duplicate container name ${task.name}`);
                    assets.containers[task.name] = task.loadedContainer;
                    return;
                }
                if (task instanceof ParticlesAssetTask) {
                    if (task.name in assets.particles) reject(`Duplicate particle name ${task.name}`);
                    assets.particles[task.name] = task.loadedParticleSystem;
                    return;
                }
                if (task instanceof BinaryFileAssetTask) {
                    if (task.name in assets.sounds) reject(`Duplicate container name ${task.name}`);
                    assets.sounds[task.name] = new Sound(task.name + "sound", task.data, scene, null, {
                        loop: false
                    });
                    return;
                }
                reject('task was not an instanceof any known AssetTask');
            });

            assets.meshes = loadedMeshes;
            resolve(assets);
        };

        assetsManager.load();
    });
};

const internalAssetPaths: string[] = [
];

export const useAssetContext = (assetPaths: string[]) => {
    const scene = useScene();
    const [internalAssets, setInternalAssets] = useState<Assets>();
    const [assets, setAssets] = useState<Assets>(defaultAssetContext().assets);

    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        if (!scene) return;
        loadAssets(scene, internalAssetPaths).then((loadedAssets) => {
            setInternalAssets(loadedAssets);
        });
    }, [scene]);

    useEffect(() => {
        setAssetsLoaded(false);
        if (!scene) return;
        if (!internalAssets) return;
        loadAssets(scene, assetPaths).then((loadedAssets) => {
            const assets = defaultAssetContext().assets;
            assets.textures = { ...internalAssets.textures, ...loadedAssets.textures };
            assets.containers = { ...internalAssets.containers, ...loadedAssets.containers };
            assets.meshes = { ...internalAssets.meshes, ...loadedAssets.meshes };
            assets.particles = { ...internalAssets.particles, ...loadedAssets.particles };
            assets.sounds = { ...internalAssets.sounds, ...loadedAssets.sounds };
            setAssets(assets);
            setAssetsLoaded(true);
        });
    }, [assetPaths, internalAssets, scene]);

    return { assetsLoaded, assets };
};
