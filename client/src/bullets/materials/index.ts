import { Camera, Scene, ShaderMaterial } from '@babylonjs/core';
import { Assets } from '../../containers/AssetContext';
import { MaterialOptions } from '../../types/BulletTypes';
import { LOG_DEPTH } from '../../utils/Switches';
import { capFirst } from '../../utils/Utils';
import { makeFresnelMaterial } from './FresnelMaterial';
import { makeLaserMaterial } from './LaserMaterial';

const materialMap: {
    [materialName: string]: MakeMaterial;
} = {
    makeFresnelMaterial,
    makeLaserMaterial,
};

export type MakeMaterial = (materialOptions: MaterialOptions, assets: Assets, scene: Scene, mine?: boolean) => ShaderMaterial;

export const makeBulletMaterial: MakeMaterial = (materialOptions, assets, scene, mine = false) => {
    const functionName = 'make' + capFirst(materialOptions.material) + 'Material';

    if (mine) {
        materialOptions.alpha = 0.1;
        materialOptions.hasAlpha = true;
    }

    const materialFunction = materialMap[functionName];
    if (!materialFunction) throw new Error('Material type not supported: ' + materialOptions.material);
    const material = materialFunction(materialOptions, assets, scene);

    material.backFaceCulling = !materialOptions.doubleSided;
    if (LOG_DEPTH) {
        material.setFloat("logarithmicDepthConstant", 2.0 / (Math.log((<Camera>scene.activeCamera).maxZ + 1.0) / Math.LN2));
    }


    return material;
};
