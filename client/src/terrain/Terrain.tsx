import React, { useContext, useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { OctreeContext } from '../containers/OctreeContext';
import { TerrainContext } from '../containers/TerrainContext';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { SkyBox } from './SkyBox';
import { TerrainMesh } from './TerrainMesh';
import { Trees } from './Trees';

const mapSize = 5000
const heightScale = 400;

export const Terrain = () => {
    const scene = useScene();
    const { setGround } = useContext(TerrainContext)
    const { octree } = useContext(OctreeContext)

    useEffect(() => {
        if (!scene) return;

        const terrain = new TerrainMesh("terrain", "http://localhost:5000/terrain", [0.1, 0.2, 0.3, 0.4], mapSize, heightScale, newTerrain => {
            //TODO: TerrainPhysics
            // newTerrain.physicsImpostor = new PhysicsImpostor(newTerrain, PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 1 });
            // newTerrain.physicsImpostor.forceUpdate()
            setGround(newTerrain)
            octree?.dynamicContent.push(newTerrain)
            scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        }, scene)


        return () => {
            terrain.dispose()
        }
    }, [octree?.dynamicContent, scene, setGround])

    return <>
        <SkyBox />
        <Trees mapSize={mapSize} heightScale={heightScale} />
    </>
};
