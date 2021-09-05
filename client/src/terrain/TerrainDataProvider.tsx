
import { CustomProceduralTexture, Effect, Engine, RawTexture, Texture, Vector2, Vector3 } from '@babylonjs/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { HEIGHTMAP_MAX_HEIGHT } from '../utils/Constants';
import { glsl } from '../utils/MaterialUtils';
import { blerp, blerpVec } from '../utils/MathUtils';
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
    heightMapNormal?: Vector3[][];
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

export const TerrainDataProvider: React.FC<TerrainDataProviderProps> = ({ heightmapEndpoint, size, height, children }) => {
    const scene = useScene()
    const [_terrainData, _setTerrainData] = useState<_ITerrainData>({})
    const [heightMapNormalTexture, setHeightMapNormalTexture] = useState<Texture>();
    const [terrainData, setTerrainData] = useState<ITerrainData>({})

    const normalsComputed = useRef(false)

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

            const heightMapNormalTexture = new CustomProceduralTexture("terrainNormal", "terrainNormal", resolution, scene);
            heightMapNormalTexture.setTexture("heightMapTexture", heightTexture)
            heightMapNormalTexture.setFloat("terrainHeightScale", height);
            heightMapNormalTexture.setFloat("terrainSize", size);
            heightMapNormalTexture.setFloat("terrainResolution", resolution);
            heightMapNormalTexture.refreshRate = 0;
            setHeightMapNormalTexture(heightMapNormalTexture);
            normalsComputed.current = false;

            _setTerrainData({
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

    useBeforeRender(() => {
        if (!normalsComputed.current && heightMapNormalTexture && _terrainData.terrainResolution) {

            if (heightMapNormalTexture.isReady()) {
                const __terrainData = _terrainData as Required<_ITerrainData>;
                const heightMapNormal: Vector3[][] = [];
                const heightMapData = heightMapNormalTexture.readPixels() as Uint8Array;
                if (!heightMapData) return;
                for (let i = 0; i < _terrainData.terrainResolution; i++) {
                    heightMapNormal[i] = [] as Vector3[];
                    for (let j = 0; j < _terrainData.terrainResolution; j++) {
                        const pixelIndex = i + j * _terrainData.terrainResolution * 4;
                        const x = heightMapData[pixelIndex + 0] / 255;
                        const y = heightMapData[pixelIndex + 1] / 255;
                        const z = heightMapData[pixelIndex + 2] / 255;
                        heightMapNormal[i][j] = new Vector3(x, y, z);
                    }
                }

                const getNormalAtCoordinates = (x: number, z: number) => {
                    const inPos = new Vector2(x, z);
                    inPos.addInPlace(new Vector2(size / 2, size / 2))
                        .divideInPlace(new Vector2(size, size))
                        .scaleInPlace(__terrainData.terrainResolution - 1)

                    if (inPos.x < 0 || inPos.x > (__terrainData.terrainResolution - 1)) return Vector3.Up();
                    if (inPos.y < 0 || inPos.y > (__terrainData.terrainResolution - 1)) return Vector3.Up();

                    const x1 = Math.floor(inPos.x);
                    const x2 = Math.ceil(inPos.x)
                    const y1 = Math.floor(inPos.y);
                    const y2 = Math.ceil(inPos.y);

                    if (x1 === x2 && y1 === y2) {
                        return heightMapNormal[x1][y1]
                    }

                    try {
                        const normal = blerpVec(heightMapNormal, x1, y1, x2, y2, inPos.x, inPos.y);
                        return normal;
                    }
                    catch {
                        console.log({ x1, x2, y1, y2, inPos, heightMapNormal, resolution: __terrainData.terrainResolution })
                        throw new Error("Heightmap selection error, check logs")
                    }
                }
                setTerrainData({ ..._terrainData, heightMapNormal, heightMapNormalTexture, getNormalAtCoordinates })
                normalsComputed.current = true;
            }
        }
    })


    return <TerrainData.Provider value={terrainData}>
        {children}
    </TerrainData.Provider>
};
