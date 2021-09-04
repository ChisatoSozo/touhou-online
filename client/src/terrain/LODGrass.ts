import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Scene } from "@babylonjs/core/scene";
import { useContext, useEffect, useState } from "react";
import { useScene } from "react-babylonjs";
import { Assets } from "../containers/AssetContext";
import { OctreeContext } from "../containers/OctreeContext";
import { useAssets } from "../hooks/useAssets";
import { useDeltaBeforeRender } from "../hooks/useDeltaBeforeRender";
import { Grass } from "./Grass";
import { useTerrainData } from "./TerrainDataProvider";



export const TerrainGrassComponent = () => {
    const { heightMapTexture, terrainSize, terrainHeightScale, terrainResolution } = useTerrainData();
    const assets = useAssets()
    const scene = useScene()
    const { octree } = useContext(OctreeContext)
    const [grass, setGrass] = useState<LODGrass>()

    useEffect(() => {
        if (!scene || !heightMapTexture || !terrainSize || !terrainHeightScale || !terrainResolution || !octree || !assets.containers.grass) return;
        const grass = new LODGrass(assets, scene, heightMapTexture, terrainSize, terrainResolution, terrainHeightScale);
        setGrass(grass);
        octree.dynamicContent.push(...grass.grasses.map(grass => grass.grassBase))
        return () => {
            grass.dispose();
            setGrass(undefined)
        }
    }, [assets, heightMapTexture, octree, scene, terrainHeightScale, terrainResolution, terrainSize])

    useDeltaBeforeRender((scene, deltaS) => {
        grass?.update(deltaS)
    })

    return null;
}

const maxLod = 4;
const distPerLod = 16;
export class LODGrass {

    public grasses: Grass[];

    constructor(assets: Assets, scene: Scene, heightTexture: Texture, terrainSize: number, terrainResolution: number, terrainHeight: number) {
        this.grasses = [];
        for (let i = 0; i < maxLod; i++) {
            let grassStart = Math.pow(2, i);
            if (grassStart === 1) grassStart = 0;

            const grassEnd = Math.pow(2, i + 1);

            const lodPow = Math.pow(2, i);
            const stretching = (i + 1) * (i + 1);
            const density = 8. / lodPow
            this.grasses.push(new Grass(assets, scene, heightTexture, terrainSize, terrainResolution, terrainHeight, grassStart * distPerLod, grassEnd * distPerLod, density, stretching))
        }
    }
    update(time: number) {
        this.grasses.forEach(grass => grass.update(time))
    }
    dispose(): void {
        this.grasses.forEach(grass => grass.dispose())
    }
}