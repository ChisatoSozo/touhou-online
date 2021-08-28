import { BoundingInfo, Mesh, Nullable, Vector3, VertexData } from "@babylonjs/core";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { HEIGHTMAP_MAX_HEIGHT } from "../utils/Constants";
import { blerp } from "../utils/MathUtils";
import { SMOOTH_TERRAIN } from "../utils/Switches";
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


/**
 * Mesh representing the ground
 */
export class TerrainMesh extends Mesh {

    public resolution = 0;
    public size: number;
    public height: number;
    public heightMap: number[][] | undefined;
    public observer: Nullable<Observer<Scene>> = null;

    constructor(name: string, terrainEndpoint: string, lods: number[], size: number, height: number, onFinish: (ref: TerrainMesh) => void, scene: Scene) {
        super(name, scene);
        this.size = size;
        this.height = height;
        this.init(terrainEndpoint, lods, scene).then(() => onFinish(this))
    }

    private init = async (terrainEndpoint: string, lods: number[], scene: Scene) => {
        const { resolution, material, heightMap } = await createTerrainMaterial(terrainEndpoint, this.size, this.height, scene);

        this.heightMap = []
        heightMap.forEach((height, i) => {
            if (!this.heightMap) return;
            const x = Math.floor(i / resolution);
            const y = i % resolution;
            if (!this.heightMap[x]) this.heightMap[x] = [];
            this.heightMap[x][y] = height / HEIGHTMAP_MAX_HEIGHT;
        })
        this.resolution = resolution;

        const positions: number[] = [];
        const normals: number[] = [];
        const indicies: number[] = [];
        let curIndex = 0;
        const positionsMap: { [key: string]: number } = {

        }

        let lastLod = 0;
        let ring = 0;
        while (ring < (resolution - 1) / 2) {
            const ringPerc = ring / (resolution / 2)
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
                        positions.push(i + ((resolution - 1) / 2), 0, j + ((resolution - 1) / 2))
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
        this.scaling = new Vector3(this.size / resolution, 1, this.size / resolution);
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

    // /**
    //  * The minimum of x and y subdivisions
    //  */
    // public get subdivisions(): number {
    //     return Math.min(this._subdivisionsX, this._subdivisionsY);
    // }

    // /**
    //  * X subdivisions
    //  */
    // public get subdivisionsX(): number {
    //     return this._subdivisionsX;
    // }

    // /**
    //  * Y subdivisions
    //  */
    // public get subdivisionsY(): number {
    //     return this._subdivisionsY;
    // }

    // /**
    //  * This function will update an octree to help to select the right submeshes for rendering, picking and collision computations.
    //  * Please note that you must have a decent number of submeshes to get performance improvements when using an octree
    //  * @param chunksCount the number of subdivisions for x and y
    //  * @param octreeBlocksSize (Default: 32)
    //  */
    // public optimize(chunksCount: number, octreeBlocksSize = 32): void {
    //     this._subdivisionsX = chunksCount;
    //     this._subdivisionsY = chunksCount;
    //     this.subdivide(chunksCount);

    //     // Call the octree system optimization if it is defined.
    //     const thisAsAny = this as any;
    //     if (thisAsAny.createOrUpdateSubmeshesOctree) {
    //         thisAsAny.createOrUpdateSubmeshesOctree(octreeBlocksSize);
    //     }
    // }

    // /**
    //  * Returns a height (y) value in the World system :
    //  * the ground altitude at the coordinates (x, z) expressed in the World system.
    //  * @param x x coordinate
    //  * @param z z coordinate
    //  * @returns the ground y position if (x, z) are outside the ground surface.
    //  */
    public getHeightAtCoordinates(x: number, z: number): number {
        if (!this.heightMap || this.heightMap.length === 0) return 0;

        const inPos = new Vector2(x, z);
        inPos.addInPlace(new Vector2(this.size / 2, this.size / 2))
            .divideInPlace(new Vector2(this.size, this.size))
            .scaleInPlace(this.resolution - 1)

        if (inPos.x < 0 || inPos.x >= this.resolution) return 0;
        if (inPos.y < 0 || inPos.y >= this.resolution) return 0;

        const x1 = Math.floor(inPos.x);
        const x2 = Math.ceil(inPos.x)
        const y1 = Math.floor(inPos.y);
        const y2 = Math.ceil(inPos.y);

        if (x1 === x2 && y1 === y2) {
            return this.heightMap[x1][y1] * this.height + this.position.y
        }

        try {
            const height = blerp(this.heightMap, x1, y1, x2, y2, inPos.x, inPos.y) * this.height + this.position.y;
            return height;
        }
        catch {
            console.log({ x1, x2, y1, y2, inPos, heightMap: this.heightMap })
            throw new Error("Heightmap selection error, check logs")
        }
    }

    public isUnderground = (vec: Vector3) => {
        const height = this.getHeightAtCoordinates(vec.x, vec.z)
        if (height > vec.y) return true;
        return false;
    }

    public getBoundingInfo = () => {
        return new BoundingInfo(new Vector3(-this.size / 2, this.position.y, -this.size / 2), new Vector3(this.size / 2, this.position.y + this.height, this.size / 2))
    }

    // /**
    //  * Returns a normalized vector (Vector3) orthogonal to the ground
    //  * at the ground coordinates (x, z) expressed in the World system.
    //  * @param x x coordinate
    //  * @param z z coordinate
    //  * @returns Vector3(0.0, 1.0, 0.0) if (x, z) are outside the ground surface.
    //  */
    // public getNormalAtCoordinates(x: number, z: number): Vector3 {
    //     var normal = new Vector3(0.0, 1.0, 0.0);
    //     this.getNormalAtCoordinatesToRef(x, z, normal);
    //     return normal;
    // }

    // /**
    //  * Updates the Vector3 passed a reference with a normalized vector orthogonal to the ground
    //  * at the ground coordinates (x, z) expressed in the World system.
    //  * Doesn't update the reference Vector3 if (x, z) are outside the ground surface.
    //  * @param x x coordinate
    //  * @param z z coordinate
    //  * @param ref vector to store the result
    //  * @returns the TerrainMesh.
    //  */
    // public getNormalAtCoordinatesToRef(x: number, z: number, ref: Vector3): TerrainMesh {
    //     var world = this.getWorldMatrix();
    //     var tmpMat = TmpVectors.Matrix[5];
    //     world.invertToRef(tmpMat);
    //     var tmpVect = TmpVectors.Vector3[8];
    //     Vector3.TransformCoordinatesFromFloatsToRef(x, 0.0, z, tmpMat, tmpVect); // transform x,z in the mesh local space
    //     x = tmpVect.x;
    //     z = tmpVect.z;
    //     if (x < this._minX || x > this._maxX || z < this._minZ || z > this._maxZ) {
    //         return this;
    //     }
    //     if (!this._heightQuads || this._heightQuads.length == 0) {
    //         this._initHeightQuads();
    //         this._computeHeightQuads();
    //     }
    //     var facet = this._getFacetAt(x, z);
    //     Vector3.TransformNormalFromFloatsToRef(facet.x, facet.y, facet.z, world, ref);
    //     return this;
    // }

    // /**
    // * Force the heights to be recomputed for getHeightAtCoordinates() or getNormalAtCoordinates()
    // * if the ground has been updated.
    // * This can be used in the render loop.
    // * @returns the TerrainMesh.
    // */
    // public updateCoordinateHeights(): TerrainMesh {
    //     if (!this._heightQuads || this._heightQuads.length == 0) {
    //         this._initHeightQuads();
    //     }
    //     this._computeHeightQuads();
    //     return this;
    // }

    // // Returns the element "facet" from the heightQuads array relative to (x, z) local coordinates
    // private _getFacetAt(x: number, z: number): Vector4 {
    //     // retrieve col and row from x, z coordinates in the ground local system
    //     var col = Math.floor((x + this._maxX) * this._subdivisionsX / this._width);
    //     var row = Math.floor(-(z + this._maxZ) * this._subdivisionsY / this._height + this._subdivisionsY);
    //     var quad = this._heightQuads[row * this._subdivisionsX + col];
    //     var facet;
    //     if (z < quad.slope.x * x + quad.slope.y) {
    //         facet = quad.facet1;
    //     } else {
    //         facet = quad.facet2;
    //     }
    //     return facet;
    // }

    // //  Creates and populates the heightMap array with "facet" elements :
    // // a quad is two triangular facets separated by a slope, so a "facet" element is 1 slope + 2 facets
    // // slope : Vector2(c, h) = 2D diagonal line equation setting apart two triangular facets in a quad : z = cx + h
    // // facet1 : Vector4(a, b, c, d) = first facet 3D plane equation : ax + by + cz + d = 0
    // // facet2 :  Vector4(a, b, c, d) = second facet 3D plane equation : ax + by + cz + d = 0
    // // Returns the TerrainMesh.
    // private _initHeightQuads(): TerrainMesh {
    //     var subdivisionsX = this._subdivisionsX;
    //     var subdivisionsY = this._subdivisionsY;
    //     this._heightQuads = new Array();
    //     for (var row = 0; row < subdivisionsY; row++) {
    //         for (var col = 0; col < subdivisionsX; col++) {
    //             var quad = { slope: Vector2.Zero(), facet1: new Vector4(0.0, 0.0, 0.0, 0.0), facet2: new Vector4(0.0, 0.0, 0.0, 0.0) };
    //             this._heightQuads[row * subdivisionsX + col] = quad;
    //         }
    //     }
    //     return this;
    // }

    // // Compute each quad element values and update the the heightMap array :
    // // slope : Vector2(c, h) = 2D diagonal line equation setting apart two triangular facets in a quad : z = cx + h
    // // facet1 : Vector4(a, b, c, d) = first facet 3D plane equation : ax + by + cz + d = 0
    // // facet2 :  Vector4(a, b, c, d) = second facet 3D plane equation : ax + by + cz + d = 0
    // // Returns the TerrainMesh.
    // private _computeHeightQuads(): TerrainMesh {
    //     var positions = this.getVerticesData(VertexBuffer.PositionKind);

    //     if (!positions) {
    //         return this;
    //     }

    //     var v1 = TmpVectors.Vector3[3];
    //     var v2 = TmpVectors.Vector3[2];
    //     var v3 = TmpVectors.Vector3[1];
    //     var v4 = TmpVectors.Vector3[0];
    //     var v1v2 = TmpVectors.Vector3[4];
    //     var v1v3 = TmpVectors.Vector3[5];
    //     var v1v4 = TmpVectors.Vector3[6];
    //     var norm1 = TmpVectors.Vector3[7];
    //     var norm2 = TmpVectors.Vector3[8];
    //     var i = 0;
    //     var j = 0;
    //     var k = 0;
    //     var cd = 0;     // 2D slope coefficient : z = cd * x + h
    //     var h = 0;
    //     var d1 = 0;     // facet plane equation : ax + by + cz + d = 0
    //     var d2 = 0;

    //     var subdivisionsX = this._subdivisionsX;
    //     var subdivisionsY = this._subdivisionsY;

    //     for (var row = 0; row < subdivisionsY; row++) {
    //         for (var col = 0; col < subdivisionsX; col++) {
    //             i = col * 3;
    //             j = row * (subdivisionsX + 1) * 3;
    //             k = (row + 1) * (subdivisionsX + 1) * 3;
    //             v1.x = positions[j + i];
    //             v1.y = positions[j + i + 1];
    //             v1.z = positions[j + i + 2];
    //             v2.x = positions[j + i + 3];
    //             v2.y = positions[j + i + 4];
    //             v2.z = positions[j + i + 5];
    //             v3.x = positions[k + i];
    //             v3.y = positions[k + i + 1];
    //             v3.z = positions[k + i + 2];
    //             v4.x = positions[k + i + 3];
    //             v4.y = positions[k + i + 4];
    //             v4.z = positions[k + i + 5];

    //             // 2D slope V1V4
    //             cd = (v4.z - v1.z) / (v4.x - v1.x);
    //             h = v1.z - cd * v1.x;             // v1 belongs to the slope

    //             // facet equations :
    //             // we compute each facet normal vector
    //             // the equation of the facet plane is : norm.x * x + norm.y * y + norm.z * z + d = 0
    //             // we compute the value d by applying the equation to v1 which belongs to the plane
    //             // then we store the facet equation in a Vector4
    //             v2.subtractToRef(v1, v1v2);
    //             v3.subtractToRef(v1, v1v3);
    //             v4.subtractToRef(v1, v1v4);
    //             Vector3.CrossToRef(v1v4, v1v3, norm1);  // caution : CrossToRef uses the Tmp class
    //             Vector3.CrossToRef(v1v2, v1v4, norm2);
    //             norm1.normalize();
    //             norm2.normalize();
    //             d1 = -(norm1.x * v1.x + norm1.y * v1.y + norm1.z * v1.z);
    //             d2 = -(norm2.x * v2.x + norm2.y * v2.y + norm2.z * v2.z);

    //             var quad = this._heightQuads[row * subdivisionsX + col];
    //             quad.slope.copyFromFloats(cd, h);
    //             quad.facet1.copyFromFloats(norm1.x, norm1.y, norm1.z, d1);
    //             quad.facet2.copyFromFloats(norm2.x, norm2.y, norm2.z, d2);
    //         }
    //     }
    //     return this;
    // }

    // /**
    //  * Serializes this ground mesh
    //  * @param serializationObject object to write serialization to
    //  */
    // public serialize(serializationObject: any): void {
    //     super.serialize(serializationObject);
    //     serializationObject.subdivisionsX = this._subdivisionsX;
    //     serializationObject.subdivisionsY = this._subdivisionsY;

    //     serializationObject.minX = this._minX;
    //     serializationObject.maxX = this._maxX;

    //     serializationObject.minZ = this._minZ;
    //     serializationObject.maxZ = this._maxZ;

    //     serializationObject.width = this._width;
    //     serializationObject.height = this._height;
    // }

    // /**
    //  * Parses a serialized ground mesh
    //  * @param parsedMesh the serialized mesh
    //  * @param scene the scene to create the ground mesh in
    //  * @returns the created ground mesh
    //  */
    // public static Parse(parsedMesh: any, scene: Scene): TerrainMesh {
    //     var result = new TerrainMesh(parsedMesh.name, scene);

    //     result._subdivisionsX = parsedMesh.subdivisionsX || 1;
    //     result._subdivisionsY = parsedMesh.subdivisionsY || 1;

    //     result._minX = parsedMesh.minX;
    //     result._maxX = parsedMesh.maxX;

    //     result._minZ = parsedMesh.minZ;
    //     result._maxZ = parsedMesh.maxZ;

    //     result._width = parsedMesh.width;
    //     result._height = parsedMesh.height;

    //     return result;
    // }
}
