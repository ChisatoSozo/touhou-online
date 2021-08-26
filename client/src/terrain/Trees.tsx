import { Color3, Scalar, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Material } from '@babylonjs/core/Materials/material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import React, { useContext, useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { TerrainContext } from '../containers/TerrainContext';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { simplex } from '../utils/Noise';
import { snapToTerrain, snapVecToTerrain } from '../utils/WorldUtils';

const makeTree = (canopies: number, height: number, trunkMaterial: Material, leafMaterial: Material, scene: Scene) => {
    const curvePoints = (l: number, t: number) => {
        const path = [];
        const step = l / t;
        for (let i = 0; i < l; i += step) {
            path.push(new Vector3(0, i, 0));
            path.push(new Vector3(0, i, 0));
        }
        return path;
    };

    const nbL = canopies + 1;
    const nbS = height;
    const curve = curvePoints(nbS, nbL);
    const radiusFunction = (i: number) => {
        let fact = 1;
        if (i % 2 == 0) { fact = .5; }
        const radius = (nbL * 2 - i - 1) * fact;
        return radius;
    };

    const leaves = Mesh.CreateTube("tube", curve, 0, 10, radiusFunction, 1, scene);
    const trunk = Mesh.CreateCylinder("trunk", nbS / nbL, nbL * 1.5 - nbL / 2 - 1, nbL * 1.5 - nbL / 2 - 1, 12, 1, scene);

    leaves.material = leafMaterial;
    trunk.material = trunkMaterial;

    return Mesh.MergeMeshes([leaves, trunk], undefined, undefined, undefined, undefined, true) as Mesh;
}

interface TreesProps {
    mapSize: number
    heightScale: number
}

export const Trees: React.FC<TreesProps> = ({ mapSize, heightScale }) => {
    const scene = useScene()
    const { ground } = useContext(TerrainContext)

    useEffect(() => {
        if (!scene || !ground) return
        const trunkMaterial = new StandardMaterial("", scene)
        trunkMaterial.diffuseColor = new Color3(0.5, 0.25, 0);
        trunkMaterial.useLogarithmicDepth = true;
        const leafMaterial = new StandardMaterial("", scene)
        leafMaterial.diffuseColor = new Color3(0.2, 1.0, 0.1);
        leafMaterial.useLogarithmicDepth = true;
        const tree = makeTree(4, 20, trunkMaterial, leafMaterial, scene);
        tree.isVisible = false
        // tree.addLODLevel(1000, null);
        snapToTerrain(ground, tree), 1;

        for (let i = 0; i < 50000; i++) {
            const x = Scalar.RandomRange(-mapSize / 2, mapSize / 2);
            const z = Scalar.RandomRange(-mapSize / 2, mapSize / 2);

            const treeValue = simplex.noise2D(x / 800, z / 800);
            if (treeValue > 0.3) continue;

            const treeVec = new Vector3(x, 0, z)
            snapVecToTerrain(ground, treeVec, 1)

            if (treeVec.y > heightScale * 0.55 || treeVec.y < heightScale * 0.2) continue;

            const intersects = tree.instances.some(instance => instance.position.subtract(treeVec).lengthSquared() < 64)
            if (intersects) continue;

            const newTree = tree.createInstance("tree" + i)
            newTree.position = treeVec
        }

        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)

        return () => {
            tree.dispose();
        }

    }, [mapSize, scene, ground, heightScale])
    return null
}
