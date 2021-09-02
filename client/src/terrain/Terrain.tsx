import { Color3, Vector3 } from '@babylonjs/core';
import React, { useContext, useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { OctreeContext } from '../containers/OctreeContext';
import { TerrainContext } from '../containers/TerrainContext';
import { useAssets } from '../hooks/useAssets';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { SkyBox } from './SkyBox';
import { TerrainMesh } from './TerrainMesh';
import { Trees } from './Trees';

const mapSize = 5000
const heightScale = 400;
const waterPosition = new Vector3(0, heightScale * 0.335, 0)

export const Terrain = () => {
    const scene = useScene();
    const assets = useAssets()
    const { ground, setGround } = useContext(TerrainContext)
    const { octree } = useContext(OctreeContext)

    useEffect(() => {
        if (!scene) return;
        if (!assets.containers.grass) return;

        const terrain = new TerrainMesh("terrain", "http://localhost:5000/terrain", [0.1, 0.2, 0.3, 0.4], mapSize, heightScale, newTerrain => {
            //TODO: TerrainPhysics
            // newTerrain.physicsImpostor = new PhysicsImpostor(newTerrain, PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 1 });
            // newTerrain.physicsImpostor.forceUpdate()
            setGround(newTerrain)
            octree?.dynamicContent.push(newTerrain)
            if (newTerrain.grass?.grasses) octree?.dynamicContent.push(...newTerrain.grass.grasses.map(grass => grass.grassBase))
            scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        }, assets, scene)


        return () => {
            terrain.dispose()
        }
    }, [assets, octree?.dynamicContent, scene, setGround])

    return <>
        <SkyBox />
        <Trees mapSize={mapSize} heightScale={heightScale} />
        <ground name="water" width={mapSize} height={mapSize} position={waterPosition}>
            <standardMaterial name="water" diffuseColor={new Color3(0.5, 0.6, 0.9)} useLogarithmicDepth />
        </ground>
    </>
};
