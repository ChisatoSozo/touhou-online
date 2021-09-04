import { Scene } from "@babylonjs/core/scene";
import { useContext, useEffect, useState } from "react";
import { useScene } from "react-babylonjs";
import { Assets } from "../containers/AssetContext";
import { OctreeContext } from "../containers/OctreeContext";
import { useAssets } from "../hooks/useAssets";
import { useDeltaBeforeRender } from "../hooks/useDeltaBeforeRender";
import { Grass } from "./Grass";
import { ITerrainData, useTerrainData } from "./TerrainDataProvider";



export const TerrainGrassComponent = () => {
    const terrainData = useTerrainData();
    const assets = useAssets()
    const scene = useScene()
    const { octree } = useContext(OctreeContext)
    const [grass, setGrass] = useState<LODGrass>()

    useEffect(() => {
        if (!scene || !terrainData.heightMapTexture || !terrainData.terrainSize || !terrainData.terrainHeightScale || !terrainData.terrainResolution || !octree || !assets.containers.grass) return;
        const grass = new LODGrass(assets, scene, terrainData);
        setGrass(grass);
        octree.dynamicContent.push(...grass.grasses.map(grass => grass.grassBase))
        return () => {
            grass.dispose();
            setGrass(undefined)
        }
    }, [assets, octree, scene, terrainData])

    useDeltaBeforeRender((scene, deltaS) => {
        grass?.update(deltaS)
    })

    return null;
}

const maxLod = 4;
const distPerLod = 16;
export class LODGrass {

    public grasses: Grass[];

    constructor(assets: Assets, scene: Scene, terrainData: ITerrainData) {
        this.grasses = [];
        for (let i = 0; i < maxLod; i++) {
            let grassStart = Math.pow(2, i);
            if (grassStart === 1) grassStart = 0;

            const grassEnd = Math.pow(2, i + 1);

            const lodPow = Math.pow(2, i);
            const stretching = (i + 1) * (i + 1);
            const density = 8. / lodPow
            this.grasses.push(new Grass(assets, scene, terrainData, grassStart * distPerLod, grassEnd * distPerLod, density, stretching))
        }
    }
    update(time: number) {
        this.grasses.forEach(grass => grass.update(time))
    }
    dispose(): void {
        this.grasses.forEach(grass => grass.dispose())
    }
}