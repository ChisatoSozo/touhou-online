import { Color3, PBRMetallicRoughnessMaterial, PhysicsImpostor, Scalar, Vector3 } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { TerrainContext } from '../containers/TerrainContext';
import { DynamicTerrain } from '../forks/DynamicTerrain';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { SkyBox } from './SkyBox';
import { createTerrainMesh } from './TerrainMesh';
import { Trees } from './Trees';

const mapSize = 5000;
const heightScale = mapSize / 20;
const resolution = 8;

const mapColorIntervals = [0, 0.01, 0.03, 0.5, 0.6, 0.7, 1.3];
const mapColorsList = [
    new Color3(0, 0, 1),
    new Color3(0.8, 0.8, 0.5),
    new Color3(0, 1, 0),
    new Color3(0, 1, 0),
    new Color3(0.7, 0.3, 0),
    new Color3(0.7, 0.5, 0.3),
    new Color3(0.7, 0.5, 0.3)
];

const getColor = (height: number) => {
    const hEnd = mapColorIntervals.find((interval) => interval > height);
    if (!hEnd) throw new Error('Invalid height' + height);
    const iEnd = mapColorIntervals.indexOf(hEnd);
    const hStart = mapColorIntervals[iEnd - 1];
    const perc = Scalar.InverseLerp(hStart, hEnd, height);
    return Color3.Lerp(mapColorsList[iEnd - 1], mapColorsList[iEnd], perc);
};



const LODLimits: number[] = [];

export const Terrain = () => {
    const scene = useScene();
    const { terrain, setTerrain, setGround } = useContext(TerrainContext)

    useEffect(() => {
        if (!scene) return;
        const collisionTerrain = Mesh.CreateGroundFromHeightMap("collisionTerrain", '/terrain/height.png', mapSize, mapSize, resolution, 0, heightScale, scene, false, function () {
            collisionTerrain.physicsImpostor = new PhysicsImpostor(collisionTerrain, PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 1 });
            collisionTerrain.updateCoordinateHeights()
            setGround(collisionTerrain)
        });
        collisionTerrain.isVisible = false;

        return () => {
            collisionTerrain.geometry?.dispose()
        }
    }, [scene, setGround])

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


        let customMesh: Mesh;

        const makeTerrainMesh = async () => {
            customMesh = await createTerrainMesh("http://localhost:5000/terrain", [0.1, 0.15, 0.2, 0.25, 0.3, 0.35], scene);
            customMesh.scaling = new Vector3(5000, 5000, 5000)
        }

        makeTerrainMesh();
        return () => {
            customMesh.dispose();
        }
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

    useEffect(() => {
        if (!mapData || !scene) return
        const terrain = new DynamicTerrain("terrain", scene, {
            mapData: mapData,
            mapColors: mapColors,
            mapSubX: resolution,
            mapSubZ: resolution,
            terrainSub: resolution / 2,
        })
        const terrainMat = new PBRMetallicRoughnessMaterial("terrainMat", scene)
        terrainMat.roughness = 0.9
        terrainMat.useLogarithmicDepth = true;
        terrain.mesh.material = terrainMat

        terrain.subToleranceX = 20;
        terrain.subToleranceZ = 20;
        terrain.LODLimits = LODLimits;
        terrain.mesh.position.y = -0.1
        terrain.update(true)
        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)

        setTerrain(terrain)

        return () => {
            terrain.mesh.dispose();
            setTerrain(undefined);
        }
    }, [mapColors, mapData, scene, setTerrain]);

    // const planeRef = useRef<GroundMesh>();
    // useEffect(() => {
    //     if (!planeRef.current || !scene || !terrain) return;

    //     const water = new StandardMaterial("water", scene)
    //     water.useLogarithmicDepth = true;
    //     water.diffuseColor = new Color3(0.5, 0.8, 1.0);
    //     water.alpha = 0.9

    //     //@ts-ignore
    //     planeRef.current.material = water;
    // }, [terrain, scene])

    return <>
        <SkyBox />
        <Trees mapSize={mapSize} heightScale={heightScale} />
        {/* <ground position-y={heightScale * 0.16} ref={planeRef} width={mapSize * 2} height={mapSize * 2} name="water" /> */}
    </>
};
