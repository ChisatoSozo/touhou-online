import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Scene } from "@babylonjs/core/scene";
import { Assets } from "../containers/AssetContext";
import { Grass } from "./Grass";

const maxLod = 2;
const distPerLod = 128;

export class LODGrass {

    public grasses: Grass[];

    constructor(assets: Assets, scene: Scene, heightTexture: Texture, terrainSize: number, terrainResolution: number, terrainHeight: number) {
        this.grasses = [];
        for (let i = 0; i < maxLod; i++) {
            let grassStart = Math.pow(2, i);
            if (grassStart === 1) grassStart = 0;

            const grassEnd = Math.pow(2, i + 1);

            const lodPow = Math.pow(2, i);
            const stretching = Math.pow(1.4, i);
            const density = 2 / lodPow
            this.grasses.push(new Grass(assets, scene, heightTexture, terrainSize, terrainResolution, terrainHeight, grassStart * distPerLod, grassEnd * distPerLod, density, stretching))
        }
    }
    dispose(): void {
        this.grasses.forEach(grass => grass.dispose())
    }
}