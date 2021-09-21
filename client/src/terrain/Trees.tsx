import { MultiMaterial, RawTexture, Scalar, Vector3 } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import React, { useContext, useEffect, useMemo } from 'react';
import { useScene } from 'react-babylonjs';
import { useMultiModels } from '../hooks/useModel';
import { ShadowContext } from '../lights/Sun';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { makeCellMaterial } from '../utils/MaterialUtils';
import { getRandomInt } from '../utils/MathUtils';
import { simplex } from '../utils/Noise';
import { LOG_DEPTH } from '../utils/Switches';
import { snapToHeightmap, snapVecToHeightmap } from '../utils/WorldUtils';
import { useTerrainData } from './TerrainDataProvider';

interface TreesProps {
    mapSize: number
    heightScale: number
}

const treeChildPaths = [[0, 1], [0, 1]];
const treeModels = ["Tree_1", "Tree_3"];
const treeResolution = 250;
export const Trees: React.FC<TreesProps> = ({ mapSize, heightScale }) => {
    const scene = useScene()
    const terrainData = useTerrainData()
    const tree = useMultiModels(treeModels, treeChildPaths)
    const { addShadowCaster } = useContext(ShadowContext)

    const mergedTrees = useMemo(() => {
        if (!tree || !scene) return;
        const outMeshes: Mesh[] = [];

        tree.forEach(treeInst => {
            const allMeshes: Mesh[] = [];
            treeInst.forEach(treeMesh => {
                treeMesh.mesh.position = new Vector3(0, 0, 0)
                allMeshes.push(treeMesh.mesh)
            })



            const outMesh = Mesh.MergeMeshes(allMeshes, undefined, undefined, undefined, undefined, true) as Mesh;

            outMeshes.push(outMesh);
        })
        return outMeshes
    }, [scene, tree])

    useEffect(() => {
        if (!scene || !terrainData.heightMap || !mergedTrees || !terrainData.getNormalAtCoordinates) return


        const leafTexture = RawTexture.CreateRGBATexture(new Uint8Array([0, 153, 51, 255]), 1, 1, scene);
        const trunkTexture = RawTexture.CreateRGBATexture(new Uint8Array([128, 64, 0, 255]), 1, 1, scene);

        mergedTrees.forEach(mergedTree => {
            mergedTree.scaling = new Vector3(10, 10, 10)
            mergedTree.isVisible = false;
            mergedTree.receiveShadows = true;
            const newMultiMaterial = new MultiMaterial("treeMat", scene);
            (mergedTree.material as MultiMaterial).subMaterials.forEach((mat, i) => {
                if (!mat) return;
                console.log(mat);
                const newMaterial = makeCellMaterial("cellMat", i === 0 ? leafTexture : trunkTexture, scene, 0);
                newMaterial.useLogarithmicDepth = LOG_DEPTH
                newMultiMaterial.subMaterials.push(newMaterial)
            })
            mergedTree.material = newMultiMaterial;
            snapToHeightmap(terrainData, mergedTree);
        })

        for (let i = 0; i < treeResolution; i++) {
            for (let j = 0; j < treeResolution; j++) {
                const x = Scalar.Lerp(-mapSize / 2, mapSize / 2, i / (treeResolution - 1)) + Scalar.RandomRange(-mapSize / (treeResolution * 2), mapSize / (treeResolution * 2));
                const z = Scalar.Lerp(-mapSize / 2, mapSize / 2, j / (treeResolution - 1)) + Scalar.RandomRange(-mapSize / (treeResolution * 2), mapSize / (treeResolution * 2));

                const treeValue = simplex.noise2D(x / 800, z / 800);
                if (treeValue > 0.3) continue;

                const treeIndex = getRandomInt(0, mergedTrees.length - 1)
                const treeNormal = terrainData.getNormalAtCoordinates(x, z);
                const treeVec = new Vector3(x, 0, z)
                snapVecToHeightmap(terrainData, treeVec, -0.5)

                if (treeVec.y > heightScale * 0.55 || treeVec.y < heightScale * 0.3410 || treeNormal.y < 0.8) continue;

                const treeMesh = mergedTrees[treeIndex];

                const newTree = treeMesh.createInstance("tree" + i)
                newTree.position = treeVec
                newTree.scaling.scaleInPlace(Scalar.RandomRange(0.8, 1.5))
                newTree.rotate(Vector3.Up(), Scalar.RandomRange(0, Math.PI * 2))
                newTree.freezeWorldMatrix();
                addShadowCaster(newTree)
            }
        }

        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)

        return () => {
            mergedTrees.forEach(tree => tree.dispose());
        }

    }, [mapSize, scene, tree, heightScale, mergedTrees, terrainData, addShadowCaster])
    return null
}
