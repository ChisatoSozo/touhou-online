import { BoundingInfo, Mesh, Nullable, Vector3, VertexData } from "@babylonjs/core";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { useContext, useEffect } from "react";
import { useScene } from "react-babylonjs";
import { Assets } from "../containers/AssetContext";
import { OctreeContext } from "../containers/OctreeContext";
import { TerrainContext } from "../containers/TerrainContext";
import { useAssets } from "../hooks/useAssets";
import { MAX_MESHES_IN_SCENE } from "../utils/Constants";
import { SMOOTH_TERRAIN } from "../utils/Switches";
import { useTerrainData } from "./TerrainDataProvider";
import { createTerrainMaterial } from "./TerrainMaterial";

type SquareType = "bottomLeftCorner" |
    "topLeftCorner" |
    "bottomRightCorner" |
    "topRightCorner" |
    "bottomEdge" |
    "leftEdge" |
    "topEdge" |
    "rightEdge" |
    "none"

const tesselations: { [key in SquareType]: number[][] } = {
    "bottomLeftCorner": [
        [0, 0], [1, 0], [1, .5],
        [0, 0], [1, .5], [1, 1],
        [0, 0], [1, 1], [.5, 1],
        [0, 0], [.5, 1], [0, 1],
    ],
    "topLeftCorner": [
        [0, 1], [0, 0], [.5, 0],
        [0, 1], [.5, 0], [1, 0],
        [0, 1], [1, 0], [1, .5],
        [0, 1], [1, .5], [1, 1],
    ],
    "bottomRightCorner": [
        [1, 0], [1, 1], [.5, 1],
        [1, 0], [.5, 1], [0, 1],
        [1, 0], [0, 1], [0, .5],
        [1, 0], [0, .5], [0, 0],
    ],
    "topRightCorner": [
        [1, 0], [1, 1], [.5, 0],
        [.5, 0], [1, 1], [0, 0],
        [0, 0], [1, 1], [0, .5],
        [0, .5], [1, 1], [0, 1],
    ],
    "bottomEdge": [
        [0, 0], [1, 0], [0.5, 0.5],
        [0, 0], [0.5, 0.5], [0, 0.5],
        [0, 0.5], [0.5, 0.5], [0, 1],
        [0, 1], [0.5, 0.5], [0.5, 1],
        [0.5, 1], [0.5, 0.5], [1, 1],
        [1, 1], [0.5, 0.5], [1, 0.5],
        [1, 0.5], [0.5, 0.5], [1, 0],
    ],
    "leftEdge": [
        [0, 1], [0, 0], [0.5, 0.5],
        [0, 1], [0.5, 0.5], [0.5, 1],
        [0.5, 1], [0.5, 0.5], [1, 1],
        [1, 1], [0.5, 0.5], [1, 0.5],
        [1, 0.5], [0.5, 0.5], [1, 0],
        [1, 0], [0.5, 0.5], [0.5, 0],
        [0.5, 0], [0.5, 0.5], [0, 0],
    ],
    "topEdge": [
        [1, 1], [0, 1], [0.5, 0.5],
        [1, 1], [0.5, 0.5], [1, 0.5],
        [1, 0.5], [0.5, 0.5], [1, 0],
        [1, 0], [0.5, 0.5], [0.5, 0],
        [0.5, 0], [0.5, 0.5], [0, 0],
        [0, 0], [0.5, 0.5], [0, 0.5],
        [0, 0.5], [0.5, 0.5], [0, 1],
    ],
    "rightEdge": [
        [1, 0], [1, 1], [0.5, 0.5],
        [1, 0], [0.5, 0.5], [0.5, 0],
        [0.5, 0], [0.5, 0.5], [0, 0],
        [0, 0], [0.5, 0.5], [0, 0.5],
        [0, 0.5], [0.5, 0.5], [0, 1],
        [0, 1], [0.5, 0.5], [0.5, 1],
        [0.5, 1], [0.5, 0.5], [1, 1],
    ],
    "none": [
        [0, 0], [1, 0], [1, 1],
        [0, 0], [1, 1], [0, 1],
    ]
}

interface SquareDef {
    squareType: SquareType;
    bottomLeft: number[]
}

const constructRing = (ring: number, ringSize: number) => {

    const squares: SquareDef[] = [];

    if (ring !== 0) {
        //leftEdge
        for (let y = -ring; y < ring; y += ringSize) {
            const x = -ring - ringSize;
            squares.push({
                squareType: "leftEdge",
                bottomLeft: [x, y]
            })
        }
        //rightEdge
        for (let y = -ring; y < ring; y += ringSize) {
            const x = ring;
            squares.push({
                squareType: "rightEdge",
                bottomLeft: [x, y]
            })
        }
        //bottomEdge
        for (let x = -ring; x < ring; x += ringSize) {
            const y = -ring - ringSize;
            squares.push({
                squareType: "bottomEdge",
                bottomLeft: [x, y]
            })
        }
        //topEdge
        for (let x = -ring; x < ring; x += ringSize) {
            const y = ring;
            squares.push({
                squareType: "topEdge",
                bottomLeft: [x, y]
            })
        }
    }

    //bottomLeft
    squares.push({
        squareType: "bottomLeftCorner",
        bottomLeft: [-ring - ringSize, -ring - ringSize]
    })
    //bottomRight
    squares.push({
        squareType: "bottomRightCorner",
        bottomLeft: [ring, -ring - ringSize]
    })
    //topLeft
    squares.push({
        squareType: "topLeftCorner",
        bottomLeft: [-ring - ringSize, ring]
    })
    //bottomRight
    squares.push({
        squareType: "topRightCorner",
        bottomLeft: [ring, ring]
    })
    return squares
}

export const TerrainMeshComponent = () => {
    const scene = useScene();
    const assets = useAssets()
    const { setGround } = useContext(TerrainContext)
    const { octree } = useContext(OctreeContext)
    const { terrainSize, terrainHeightScale, heightMapTexture, terrainResolution, heightMap } = useTerrainData()

    useEffect(() => {
        if (!terrainSize || !terrainHeightScale || !scene || !octree || !heightMapTexture || !terrainResolution || !heightMap) return;
        const terrain = new TerrainMesh("terrain", heightMapTexture, heightMap, terrainResolution, [0.1, 0.2, 0.3, 0.4], terrainSize, terrainHeightScale, newTerrain => {
            //TODO: TerrainPhysics
            // newTerrain.physicsImpostor = new PhysicsImpostor(newTerrain, PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 1 });
            // newTerrain.physicsImpostor.forceUpdate()
            setGround(newTerrain)
            octree.dynamicContent.push(newTerrain)
            scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        }, assets, scene)

        return () => {
            terrain.dispose();
        }
    }, [assets, heightMap, heightMapTexture, octree, scene, setGround, terrainHeightScale, terrainResolution, terrainSize])
    return null;
}

/**
 * Mesh representing the ground
 */
export class TerrainMesh extends Mesh {

    public resolution = 0;
    public size: number;
    public height: number;
    public heightMap: number[][] | undefined;
    public assets: Assets;
    public observer: Nullable<Observer<Scene>> = null;

    constructor(name: string, heightMapTexture: Texture, heightMap: number[][], terrainResolution: number, lods: number[], size: number, height: number, onFinish: (ref: TerrainMesh) => void, assets: Assets, scene: Scene) {
        super(name, scene);
        this.size = size;
        this.height = height;
        this.assets = assets;
        this.heightMap = heightMap;
        this.init(heightMapTexture, terrainResolution, lods, scene).then(() => onFinish(this))
    }

    private init = async (heightMapTexture: Texture, terrainResolution: number, lods: number[], scene: Scene) => {
        const material = createTerrainMaterial(heightMapTexture, terrainResolution, this.size, this.height, lods, scene);

        const positions: number[] = [];
        const normals: number[] = [];
        const indicies: number[] = [];
        let curIndex = 0;
        const positionsMap: { [key: string]: number } = {

        }

        let lastLod = 0;
        let ring = 0;
        while (ring < (terrainResolution - 1) / 2) {
            const ringPerc = ring / (terrainResolution / 2)
            let curLod = 0;
            lods.forEach((lod, i) => {
                if (ringPerc >= lod) {
                    curLod = i + 1
                }
            })

            if (curLod - lastLod > 1) {
                curLod = lastLod + 1
            }

            const ringSize = Math.pow(2, curLod);
            const squares = constructRing(ring, ringSize)

            squares.forEach(square => {
                const [x, y] = square.bottomLeft;
                const squareCoords = curLod === lastLod ? tesselations.none : tesselations[square.squareType];
                squareCoords.forEach(coord => {
                    const i = coord[0] * ringSize + x;
                    const j = coord[1] * ringSize + y;
                    const positionLookup = `${i},${j}`
                    const index = positionsMap[positionLookup];
                    if (index) {
                        indicies.push(index);
                    }
                    else {
                        positionsMap[positionLookup] = curIndex;
                        indicies.push(curIndex);
                        positions.push(i + ((terrainResolution - 1) / 2), 0, j + ((terrainResolution - 1) / 2))
                        normals.push(0, 1, 0);
                        curIndex++;
                    }
                })
            })

            ring += ringSize
            lastLod = curLod;
        }


        const vertexData = new VertexData();

        vertexData.positions = positions;

        vertexData.indices = indicies;
        if (SMOOTH_TERRAIN) vertexData.normals = normals;

        vertexData.applyToMesh(this);

        this.alwaysSelectAsActiveMesh = true;
        //@ts-ignore
        this.material = material;
        this.scaling = new Vector3(this.size / terrainResolution, 1, this.size / terrainResolution);
        this.position = new Vector3(-this.size / 2, 0, -this.size / 2);

        return;
    }

    /**
     * "TerrainMesh"
     * @returns "TerrainMesh"
     */
    public getClassName(): string {
        return "TerrainMesh";
    }

    public getBoundingInfo = () => {
        return new BoundingInfo(new Vector3(-this.size / 2, this.position.y, -this.size / 2), new Vector3(this.size / 2, this.position.y + this.height, this.size / 2))
    }
}
