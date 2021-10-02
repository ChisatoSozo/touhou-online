/* eslint-disable */

import { AbstractAssetTask, AssetsManager, Engine, ParticleHelper, ParticleSystemSet, RawTexture, Scene, Texture, Vector2, Vector3 } from '@babylonjs/core';
import { HEIGHTMAP_MAX_HEIGHT } from '../utils/Constants';
import { blerp, blerpVecFunc } from '../utils/MathUtils';

const getNormal = (heightMap: number[][], resolution: number, size: number, height: number, i: number, j: number) => {

    if (i === 0 || j === 0 || i === resolution - 1 || j === resolution - 1) return [0, 1, 0];

    const pixelSize = 1.;
    const cellSize = size / resolution;

    const l = heightMap[i - pixelSize][j] * height;
    const u = heightMap[i][j + pixelSize] * height;
    const r = heightMap[i + pixelSize][j] * height;
    const d = heightMap[i][j - pixelSize] * height;

    const first = [0, u - d, 2 * cellSize]
    const second = [2 * cellSize, r - l, 0]

    const x = -first[2] * second[1];
    const y = first[2] * second[0];
    const z = -first[1] * second[0];

    const len = Math.sqrt(x * x + y * y + z * z)
    return [x / len, y / len, z / len];
}

const calcNormals = (heightMap: number[][], resolution: number, size: number, height: number) => {
    const normalBuffer = new Float32Array(resolution * resolution * 4);
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const index = i * resolution + j;
            const normal = getNormal(heightMap, resolution, size, height, i, j);
            normalBuffer[index * 4 + 0] = normal[0];
            normalBuffer[index * 4 + 1] = normal[1];
            normalBuffer[index * 4 + 2] = normal[2];
            normalBuffer[index * 4 + 0] = 0;
        }
    }
    return normalBuffer
}

export class CustomAssetsManager extends AssetsManager {
    public addParticlesTask(particleName: string, rootUrl: string): ParticlesAssetTask {
        const task = new ParticlesAssetTask(particleName, rootUrl);
        this._tasks.push(task);

        return task;
    }

    public addTerrainTask(name: string, baseURL: string, height: number, size: number): TerrainAssetTask {
        const task = new TerrainAssetTask(name, baseURL, height, size);
        this._tasks.push(task);

        return task;
    }
}

export class ParticlesAssetTask extends AbstractAssetTask {
    /**
     * Get the loaded particle system
     */
    //@ts-ignore
    public loadedParticleSystem: IParticleSystem;

    /**
     * Callback called when the task is successful
     */
    //@ts-ignore
    public onSuccess: (task: ParticlesAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    //@ts-ignore
    public onError: (task: ParticlesAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new ParticlesAssetTask
     * @param name defines the name of the task
     * @param meshesNames defines the list of mesh's names you want to load
     * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
     * @param sceneFilename defines the filename or File of the scene to load from
     */
    constructor(
        /**
         * Defines the particle system json you want to load
         */
        public particleName: string,
        /**
         * Defines the root url to use as a base to load your meshes and associated resources
         */
        public rootUrl: string,

    ) {
        super(particleName);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        ParticleHelper.BaseAssetsUrl = this.rootUrl;
        ParticleSystemSet.BaseAssetsUrl = this.rootUrl;
        ParticleHelper.CreateAsync(this.name, scene, false)
            .then((set) => {
                this.loadedParticleSystem = set.systems[0];
                onSuccess();
            })
            .catch((reason) => {
                onError('Particle system failed to load', reason);
            });
    }
}

export interface ITerrainData {
    heightMap: number[][];
    heightMapNormalBuffer: Float32Array;
    terrainResolution: number;
    terrainSize: number;
    terrainHeightScale: number;
    heightMapTexture: Texture;
    heightMapNormalTexture: Texture;
    getHeightAtCoordinates: (x: number, z: number) => number;
    getNormalAtCoordinates: (x: number, z: number) => Vector3;
}

export class TerrainAssetTask extends AbstractAssetTask {
    /**
     * Get the loaded particle system
     */
    //@ts-ignore
    public loadedTerrainData: ITerrainData;

    /**
     * Callback called when the task is successful
     */
    //@ts-ignore
    public onSuccess: (task: TerrainAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    //@ts-ignore
    public onError: (task: TerrainAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new ParticlesAssetTask
     * @param name defines the name of the task
     * @param meshesNames defines the list of mesh's names you want to load
     * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
     * @param sceneFilename defines the filename or File of the scene to load from
     */
    constructor(
        public name: string,
        private baseURL: string,
        private height: number,
        private size: number
    ) {
        super(name);
    }

    private getTerrainData = async (scene: Scene) => {
        const dataArray: number[] = [];
        // eslint-disable-next-line no-constant-condition
        const data: ArrayBuffer = await fetch(this.baseURL + "/" + this.name, { mode: 'cors' }).then(response => response.arrayBuffer());
        const resultData = new Uint16Array(data)
        let max = 0
        resultData.forEach((datum, i) => {
            dataArray[i] = datum / HEIGHTMAP_MAX_HEIGHT;
            if (datum > max) max = datum;
        })
        const heightMapBuffer = new Float32Array(dataArray)
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

        const getHeightAtCoordinates = (x: number, z: number) => {
            const inPos = new Vector2(x, z);
            inPos.addInPlace(new Vector2(this.size / 2, this.size / 2))
                .divideInPlace(new Vector2(this.size, this.size))
                .scaleInPlace(resolution - 1)
                .addInPlace(new Vector2(0.5, 0.5));

            if (inPos.x < 0 || inPos.x > (resolution - 1)) return 0;
            if (inPos.y < 0 || inPos.y > (resolution - 1)) return 0;

            const x1 = Math.floor(inPos.x);
            const x2 = Math.ceil(inPos.x)
            const y1 = Math.floor(inPos.y);
            const y2 = Math.ceil(inPos.y);

            if (x1 === x2 && y1 === y2) {
                return heightMap[x1][y1] * this.height
            }

            try {
                const y = blerp(heightMap, x1, y1, x2, y2, inPos.x, inPos.y) * this.height;
                return y;
            }
            catch {
                console.log({ x1, x2, y1, y2, inPos, heightMap: heightMap, resolution: resolution })
                throw new Error("Heightmap selection error, check logs")
            }
        }

        const heightMapNormalBuffer = calcNormals(heightMap, resolution, this.size, this.height);

        const getNormal = (i: number, j: number) => {
            const index = i * resolution + j;
            const x = heightMapNormalBuffer[index * 4 + 0];
            const y = heightMapNormalBuffer[index * 4 + 1];
            const z = heightMapNormalBuffer[index * 4 + 2];
            return new Vector3(x, y, z);
        }

        const getNormalAtCoordinates = (x: number, z: number) => {
            const inPos = new Vector2(x, z);
            inPos.addInPlace(new Vector2(this.size / 2, this.size / 2))
                .divideInPlace(new Vector2(this.size, this.size))
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

        const heightTexture = RawTexture.CreateRTexture(heightMapBuffer, resolution, resolution, scene, false, false, Engine.TEXTURE_BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT);
        const heightMapNormalTexture = RawTexture.CreateRGBATexture(heightMapNormalBuffer, resolution, resolution, scene, false, false, Engine.TEXTURE_BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT);

        this.loadedTerrainData = {
            terrainResolution: resolution,
            terrainSize: this.size,
            terrainHeightScale: this.height,
            heightMap: heightMap,
            heightMapNormalBuffer,
            getHeightAtCoordinates,
            getNormalAtCoordinates,
            heightMapTexture: heightTexture,
            heightMapNormalTexture,
        }
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public runTask = async (scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) => {
        try {
            await this.getTerrainData(scene)
            onSuccess()
        }
        catch (e) {
            onError("Unknown error", e)
        }
    }
}
