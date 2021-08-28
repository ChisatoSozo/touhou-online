import { TransformNode, Vector3 } from "@babylonjs/core";
import { TerrainMesh } from "../terrain/TerrainMesh";

export const snapToTerrain = (ground: TerrainMesh, object: TransformNode, offsetY = 0) => {
    const objectAbsolutePosition = object.getAbsolutePosition();
    const newY = ground.getHeightAtCoordinates(object.position.x, object.position.z);
    const dy = newY - objectAbsolutePosition.y;
    object.position.y += dy + offsetY;
}

export const snapVecToTerrain = (ground: TerrainMesh, position: Vector3, offsetY = 0) => {
    const objectAbsolutePosition = position;
    const newY = ground.getHeightAtCoordinates(position.x, position.z);
    const dy = newY - objectAbsolutePosition.y;
    position.y += dy + offsetY;
}