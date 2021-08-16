import { Scene } from '@babylonjs/core';
import { useBeforeRender } from 'react-babylonjs';

type BeforeRenderFunc = (scene: Scene, deltaS: number) => void;

export const useDeltaBeforeRender = (callback: BeforeRenderFunc) => {
    useBeforeRender((scene) => {
        const deltaS = scene.getEngine().getDeltaTime() / 1000;
        callback(scene, deltaS);
    });
};
