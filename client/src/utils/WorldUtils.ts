import { TransformNode, Vector3 } from "@babylonjs/core";
import { ITerrainData } from "../terrain/TerrainDataProvider";

export const snapToHeightmap = (terrainData: ITerrainData, object: TransformNode, offsetY = 0) => {
    if (!terrainData.getHeightAtCoordinates) return;
    const objectAbsolutePosition = object.getAbsolutePosition();
    const newY = terrainData.getHeightAtCoordinates(object.position.x, object.position.z);
    const dy = newY - objectAbsolutePosition.y;
    object.position.y += dy + offsetY;
}


export const snapVecToHeightmap = (terrainData: ITerrainData, position: Vector3, offsetY = 0) => {
    if (!terrainData.getHeightAtCoordinates) return;
    const objectAbsolutePosition = position;
    const newY = terrainData.getHeightAtCoordinates(position.x, position.z);
    const dy = newY - objectAbsolutePosition.y;
    position.y += dy + offsetY;
}
