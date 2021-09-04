
import { Engine, RawTexture, Texture, Vector2 } from '@babylonjs/core';
import React, { useContext, useEffect, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { HEIGHTMAP_MAX_HEIGHT } from '../utils/Constants';
import { blerp } from '../utils/MathUtils';

export interface ITerrainData {
    heightMapTexture?: Texture;
    heightMap?: number[][];
    terrainResolution?: number;
    terrainSize?: number;
    terrainHeightScale?: number;
    getHeightAtCoordinates?: (x: number, z: number) => number;
}

export const TerrainData = React.createContext<ITerrainData>({});

interface TerrainDataProviderProps {
    heightmapEndpoint: string;
    size: number;
    height: number;
}

export const useTerrainData = () => {
    return useContext(TerrainData)
}

export const TerrainDataProvider: React.FC<TerrainDataProviderProps> = ({ heightmapEndpoint, size, height, children }) => {
    const scene = useScene()
    const [terrainData, setTerrainData] = useState<ITerrainData>({})

    useEffect(() => {
        if (!scene) return;
        const getTerrainData = async () => {
            const data: { data: number[] } = await fetch(heightmapEndpoint, { mode: 'cors' }).then(response => response.json());
            const heightData = new Float32Array(data.data.length * 4)
            data.data.forEach((datum, i) => {
                heightData[i * 4] = datum / HEIGHTMAP_MAX_HEIGHT;
                heightData[i * 4 + 1] = datum / HEIGHTMAP_MAX_HEIGHT;
                heightData[i * 4 + 2] = datum / HEIGHTMAP_MAX_HEIGHT;
                heightData[i * 4 + 3] = datum / HEIGHTMAP_MAX_HEIGHT;
            })

            const resolution = Math.sqrt(data.data.length)
            const heightMap: number[][] = []
            data.data.forEach((height, i) => {
                if (!heightMap) return;
                const x = Math.floor(i / resolution);
                const y = i % resolution;
                if (!heightMap[x]) heightMap[x] = [];
                heightMap[x][y] = height / HEIGHTMAP_MAX_HEIGHT;
            })

            const logRes = Math.log2(resolution - 1)
            if (logRes !== Math.floor(logRes)) {
                throw new Error("heightmap must be one more than a power of two, is: " + resolution)
            }

            const heightTexture = RawTexture.CreateRGBATexture(heightData, resolution, resolution, scene, false, false, Engine.TEXTURE_BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT);

            const getHeightAtCoordinates = (x: number, z: number) => {
                const inPos = new Vector2(x, z);
                inPos.addInPlace(new Vector2(size / 2, size / 2))
                    .divideInPlace(new Vector2(size, size))
                    .scaleInPlace(resolution - 1)

                if (inPos.x < 0 || inPos.x > (resolution - 1)) return 0;
                if (inPos.y < 0 || inPos.y > (resolution - 1)) return 0;

                const x1 = Math.floor(inPos.x);
                const x2 = Math.ceil(inPos.x)
                const y1 = Math.floor(inPos.y);
                const y2 = Math.ceil(inPos.y);

                if (x1 === x2 && y1 === y2) {
                    return heightMap[x1][y1] * height
                }

                try {
                    const y = blerp(heightMap, x1, y1, x2, y2, inPos.x, inPos.y) * height;
                    return y;
                }
                catch {
                    console.log({ x1, x2, y1, y2, inPos, heightMap: heightMap, resolution: resolution })
                    throw new Error("Heightmap selection error, check logs")
                }
            }

            setTerrainData({
                terrainResolution: resolution,
                terrainSize: size,
                terrainHeightScale: height,
                heightMap: heightMap,
                heightMapTexture: heightTexture,
                getHeightAtCoordinates: getHeightAtCoordinates
            })
        }
        getTerrainData();
    }, [height, heightmapEndpoint, scene, size])

    return <TerrainData.Provider value={terrainData}>
        {children}
    </TerrainData.Provider>
};
