import { Color3, PBRMetallicRoughnessMaterial, Scalar, StandardMaterial } from '@babylonjs/core';
import { GroundMesh } from '@babylonjs/core/Meshes/groundMesh';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { DynamicTerrain } from '../forks/DynamicTerrain';

const mapSize = 1000;
const heightScale = 50;
const resolution = 1024;

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



const LODLimits = [resolution / 8, resolution / 32, resolution / 128];
console.log(LODLimits)

export const Terrain = () => {
    const scene = useScene();
    const [mapData, setMapData] = useState<Float32Array>()
    useEffect(() => {
        if (!scene) return;

        const mapData = new Float32Array(resolution * resolution * 3)

        const onReady = () => {
            setMapData(mapData);
        }

        DynamicTerrain.CreateMapFromHeightMapToRef('/terrain/height.png', {
            width: mapSize,
            height: mapSize,
            subX: resolution,
            subZ: resolution,
            minHeight: 0,
            maxHeight: heightScale,
            offsetX: 0,
            offsetZ: 0,
            onReady
        }, mapData, scene)
    }, [scene]);

    const mapColors = useMemo(() => {
        if (!mapData) return new Float32Array();
        const mapColors = new Float32Array(resolution * resolution * 3);

        for (let l = 0; l < resolution; l++) {
            for (let w = 0; w < resolution; w++) {
                const i = l * resolution + w;
                const height = mapData[i * 3 + 1];

                const color = getColor(height / heightScale);

                mapColors[3 * i] = color.r;
                mapColors[3 * i + 1] = color.g;
                mapColors[3 * i + 2] = color.b;
            }
        }

        return mapColors;
    }, [mapData]);

    const [terrain, setTerrain] = useState<DynamicTerrain>()

    useEffect(() => {
        if (!mapData || !scene) return
        const terrain = new DynamicTerrain("terrain", scene, {
            mapData: mapData,
            mapColors: mapColors,
            mapSubX: resolution,
            mapSubZ: resolution,
            terrainSub: resolution / 2,
        })
        terrain.mesh.material = new PBRMetallicRoughnessMaterial("terrainMat", scene)

        terrain.subToleranceX = 20;
        terrain.subToleranceZ = 20;
        terrain.LODLimits = LODLimits;
        terrain.mesh.position.y = -0.1
        terrain.update(true)
        setTerrain(terrain)

        return () => {
            terrain.mesh.dispose();
            setTerrain(undefined);
        }
    }, [mapColors, mapData, scene]);

    const planeRef = useRef<GroundMesh>();
    useEffect(() => {
        if (!planeRef.current || !scene || !terrain) return;

        const water = new StandardMaterial("water", scene)
        water.diffuseColor = new Color3(0.5, 0.8, 1.0);
        water.alpha = 0.9

        //@ts-ignore
        planeRef.current.material = water;
    }, [terrain, scene])

    return <>
        <ground position-y={heightScale * 0.16} ref={planeRef} width={mapSize * 2} height={mapSize * 2} name="water" />
    </>
};
