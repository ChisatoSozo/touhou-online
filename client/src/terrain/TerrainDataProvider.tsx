
import { Effect, Engine, RawTexture, Texture, Vector2, Vector3 } from '@babylonjs/core';
import React, { useContext, useEffect, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { HEIGHTMAP_MAX_HEIGHT } from '../utils/Constants';
import { glsl } from '../utils/MaterialUtils';
import { blerp, blerpVecFunc } from '../utils/MathUtils';
import { COMMON_SHADER_FUNC } from './CommonShader';

Effect.ShadersStore["terrainNormalPixelShader"] = glsl`
    varying vec2 vUV;

    uniform sampler2D heightMapTexture;
    uniform float terrainHeightScale;
    uniform float terrainSize;
    uniform float terrainResolution;

    ${COMMON_SHADER_FUNC}

    void main(void) {
        float pixelSize = 1./terrainResolution;
        float cellSize = 0.5*terrainSize*pixelSize;

        float l = textureBicubic(heightMapTexture, vec2(vUV.x - pixelSize, vUV.y)).x * terrainHeightScale;
        float u = textureBicubic(heightMapTexture, vec2(vUV.x, vUV.y + pixelSize)).x * terrainHeightScale;
        float r = textureBicubic(heightMapTexture, vec2(vUV.x + pixelSize, vUV.y)).x * terrainHeightScale;
        float d = textureBicubic(heightMapTexture, vec2(vUV.x, vUV.y - pixelSize)).x * terrainHeightScale;

        vec3 vu = vec3(0, u, cellSize);
        vec3 vd = vec3(0, d, -cellSize);
        vec3 vr = vec3(cellSize, r, 0);
        vec3 vl = vec3(-cellSize, l, 0);

        vec3 terrainNormal = normalize(cross((vu - vd), (vr - vl)));
        gl_FragColor = vec4(terrainNormal, 1.0);
    }
`;

export interface _ITerrainData {
    heightMapTexture?: Texture;
    heightMap?: number[][];
    terrainResolution?: number;
    terrainSize?: number;
    terrainHeightScale?: number;
    getHeightAtCoordinates?: (x: number, z: number) => number;
}

export interface ITerrainData {
    heightMapTexture?: Texture;
    heightMapNormalTexture?: Texture;
    heightMap?: number[][];
    heightMapNormalBuffer?: Float32Array;
    terrainResolution?: number;
    terrainSize?: number;
    terrainHeightScale?: number;
    getHeightAtCoordinates?: (x: number, z: number) => number;
    getNormalAtCoordinates?: (x: number, z: number) => Vector3;
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

const getNormal = (heightMap: number[][], resolution: number, size: number, height: number, i: number, j: number) => {

    if (i === 0 || j === 0 || i === resolution - 1 || j === resolution - 1) return new Vector3(0, 1, 0);

    const pixelSize = 1.;
    const cellSize = size / resolution;

    const l = heightMap[i - pixelSize][j] * height;
    const u = heightMap[i][j + pixelSize] * height;
    const r = heightMap[i + pixelSize][j] * height;
    const d = heightMap[i][j - pixelSize] * height;

    const vu = new Vector3(0, u, cellSize);
    const vd = new Vector3(0, d, -cellSize);
    const vr = new Vector3(cellSize, r, 0);
    const vl = new Vector3(-cellSize, l, 0);

    return vu.subtract(vd).cross(vr.subtract(vl)).normalize();
}

const calcNormals = (heightMap: number[][], resolution: number, size: number, height: number) => {
    const normalBuffer = new Float32Array(resolution * resolution * 4);
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const index = i * resolution + j;
            const normal = getNormal(heightMap, resolution, size, height, i, j);
            normalBuffer[index * 4 + 0] = normal.x;
            normalBuffer[index * 4 + 1] = normal.y;
            normalBuffer[index * 4 + 2] = normal.z;
            normalBuffer[index * 4 + 0] = 0;
        }
    }
    return normalBuffer
}

export const TerrainDataProvider: React.FC<TerrainDataProviderProps> = ({ heightmapEndpoint, size, height, children }) => {
    const scene = useScene()
    const [terrainData, setTerrainData] = useState<ITerrainData>({})

    useEffect(() => {
        if (!scene) return;
        const getTerrainData = async () => {
            const dataArray: number[] = [];
            // eslint-disable-next-line no-constant-condition
            const data: ArrayBuffer = await fetch(heightmapEndpoint + '/terrain', { mode: 'cors' }).then(response => response.arrayBuffer());
            const resultData = new Uint16Array(data)
            let max = 0
            resultData.forEach((datum, i) => {
                dataArray[i] = datum / HEIGHTMAP_MAX_HEIGHT;
                if (datum > max) max = datum;
            })
            const heightData = new Float32Array(dataArray)
            const resolution = Math.sqrt(dataArray.length)
            const heightMap: number[][] = []
            dataArray.forEach((height, i) => {
                if (!heightMap) return;
                const x = Math.floor(i / resolution);
                const y = i % resolution;
                if (!heightMap[x]) heightMap[x] = [];
                heightMap[x][y] = height;
            })

            const logRes = Math.log2(resolution - 1)
            if (logRes !== Math.floor(logRes)) {
                throw new Error("heightmap must be one more than a power of two, is: " + resolution)
            }

            const heightTexture = RawTexture.CreateRTexture(heightData, resolution, resolution, scene, false, false, Engine.TEXTURE_BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT);

            const getHeightAtCoordinates = (x: number, z: number) => {
                const inPos = new Vector2(x, z);
                inPos.addInPlace(new Vector2(size / 2, size / 2))
                    .divideInPlace(new Vector2(size, size))
                    .scaleInPlace(resolution - 1)
                    .addInPlace(new Vector2(0.5, 0.5));

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

            const heightMapNormalBuffer = calcNormals(heightMap, resolution, size, height);
            const heightMapNormalTexture = RawTexture.CreateRGBATexture(heightMapNormalBuffer, resolution, resolution, scene, false, false, Engine.TEXTURE_BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT);

            const getNormal = (i: number, j: number) => {
                const index = i * resolution + j;
                const x = heightMapNormalBuffer[index * 4 + 0];
                const y = heightMapNormalBuffer[index * 4 + 1];
                const z = heightMapNormalBuffer[index * 4 + 2];
                return new Vector3(x, y, z);
            }

            const getNormalAtCoordinates = (x: number, z: number) => {
                const inPos = new Vector2(x, z);
                inPos.addInPlace(new Vector2(size / 2, size / 2))
                    .divideInPlace(new Vector2(size, size))
                    .scaleInPlace(resolution - 1)

                if (inPos.x < 0 || inPos.x > (resolution - 1)) return Vector3.Up();
                if (inPos.y < 0 || inPos.y > (resolution - 1)) return Vector3.Up();

                const x1 = Math.floor(inPos.x);
                const x2 = Math.ceil(inPos.x)
                const y1 = Math.floor(inPos.y);
                const y2 = Math.ceil(inPos.y);

                if (x1 === x2 && y1 === y2) {
                    return getNormal(x1, y1);
                }

                try {
                    const normal = blerpVecFunc(getNormal, x1, y1, x2, y2, inPos.x, inPos.y).normalize();
                    return normal;
                }
                catch {
                    throw new Error("Heightmap normal selection error, check logs")
                }
            }

            setTerrainData({
                terrainResolution: resolution,
                terrainSize: size,
                terrainHeightScale: height,
                heightMap: heightMap,
                heightMapTexture: heightTexture,
                heightMapNormalTexture,
                heightMapNormalBuffer,
                getHeightAtCoordinates,
                getNormalAtCoordinates
            })
        }
        getTerrainData();
    }, [height, heightmapEndpoint, scene, size])


    return <TerrainData.Provider value={terrainData}>
        {children}
    </TerrainData.Provider>
};
