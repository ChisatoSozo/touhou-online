import { TransformNode, Vector3 } from "@babylonjs/core";
import { GroundMesh } from "@babylonjs/core/Meshes/groundMesh";

const _getFacetAt = (x: number, z: number, ground: GroundMesh) => {
    // retrieve col and row from x, z coordinates in the ground local system
    const col = Math.floor((x + ground._maxX) * ground._subdivisionsX / ground._width);
    const row = Math.floor(-(z + ground._maxZ) * ground._subdivisionsY / ground._height + ground._subdivisionsY);
    //@ts-ignore
    const quad = ground._heightQuads[row * ground._subdivisionsX + col];
    let facet;
    if (z < quad.slope.x * x + quad.slope.y) {
        facet = quad.facet1;
    }
    else {
        facet = quad.facet2;
    }
    return facet;
};

const getHeightAtCoordinates = (x: number, z: number, ground: GroundMesh) => {
    if (x < ground._minX || x > ground._maxX || z < ground._minZ || z > ground._maxZ) {
        return ground.position.y;
    }
    //@ts-ignore
    if (!ground._heightQuads || ground._heightQuads.length == 0) {
        //@ts-ignore
        ground._initHeightQuads();
        //@ts-ignore
        ground._computeHeightQuads();
    }
    //@ts-ignore
    const facet = _getFacetAt(x, z, ground);
    const y = -(facet.x * x + facet.z * z + facet.w) / facet.y;
    // return y in the World system
    return y;
}

export const snapToTerrain = (ground: GroundMesh, object: TransformNode, offsetY = 0) => {
    const objectAbsolutePosition = object.getAbsolutePosition();
    //@ts-ignore
    console.log(ground._heightQuads)
    const newY = getHeightAtCoordinates(object.position.x, object.position.z, ground);
    const dy = newY - objectAbsolutePosition.y;
    object.position.y += dy + offsetY;
}

export const snapVecToTerrain = (ground: GroundMesh, position: Vector3, offsetY = 0) => {
    const objectAbsolutePosition = position;
    const newY = getHeightAtCoordinates(position.x, position.z, ground);
    const dy = newY - objectAbsolutePosition.y;
    position.y += dy + offsetY;
}