import { Color3, Scalar } from '@babylonjs/core';
import { useEffect } from 'react';

const mapSize = 512;
const mapSubX = mapSize * 2; // point number on X axis
const mapSubZ = mapSize; // point number on Z axis
const mapColorIntervals = [0, 0.01, 0.03, 0.6, 1.3];
const mapColorsList = [
    new Color3(0, 0, 1),
    new Color3(0.8, 0.8, 0.5),
    new Color3(0, 1, 0),
    new Color3(0.7, 0.3, 0),
    new Color3(0.7, 0.5, 0.3),
];

const getColor = (height: number) => {
    const hEnd = mapColorIntervals.find((interval) => interval > height);
    if (!hEnd) throw new Error('Invalid height' + height);
    const iEnd = mapColorIntervals.indexOf(hEnd);
    const hStart = mapColorIntervals[iEnd - 1];
    const perc = Scalar.InverseLerp(hStart, hEnd, height);
    return Color3.Lerp(mapColorsList[iEnd - 1], mapColorsList[iEnd], perc);
};

const LODLimits = [16, 16];

export const Terrain = () => {
    useEffect(() => {}, []);
    // const scene = useScene();

    // const terrainData = useMemo(() => makeTerrain(mapSize), []);
    // const mapData = useMemo(() => {
    //     if (!scene) return;

    //     const mapData = new Float32Array(mapSubX * mapSubZ * 3);

    //     for (let l = 0; l < mapSubZ; l++) {
    //         for (let w = 0; w < mapSubX; w++) {
    //             const i = l * mapSubX + w;
    //             const point = terrainData[i];

    //             mapData[3 * i] = point.x * 5;
    //             mapData[3 * i + 1] = point.z * 1;
    //             mapData[3 * i + 2] = point.y * 5;
    //         }
    //     }

    //     return mapData;
    // }, [scene, terrainData]);

    // const mapColors = useMemo(() => {
    //     const mapColors = new Float32Array(mapSubX * mapSubZ * 3);

    //     for (let l = 0; l < mapSubZ; l++) {
    //         for (let w = 0; w < mapSubX; w++) {
    //             const i = l * mapSubX + w;
    //             const point = terrainData[i];

    //             const color = getColor(point.z);

    //             mapColors[3 * i] = color.r;
    //             mapColors[3 * i + 1] = color.g;
    //             mapColors[3 * i + 2] = color.b;
    //         }
    //     }

    //     return mapColors;
    // }, [terrainData]);

    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const terrainRef = useRef<DynamicTerrain>();

    // useEffect(() => {
    //     if (!terrainRef.current || !scene) return;
    //     terrainRef.current.mesh.material = new StandardMaterial('test', scene);
    // }, [scene]);

    // return (
    //     <dynamicTerrain
    //         name="terrain"
    //         ref={terrainRef}
    //         mapData={mapData}
    //         mapColors={mapColors}
    //         mapSubX={mapSubX}
    //         mapSubZ={mapSubZ}
    //         subToleranceX={20}
    //         subToleranceZ={20}
    //         terrainSub={256}
    //         LODLimits={LODLimits}
    //     />
    // );
    return null;
};
