import { Vector2, Vector3 } from "@babylonjs/core";
import { keyObject } from "../../containers/ControlsContext";
import { ITerrainData } from '../../forks/CustomAssetManager';
import { LATERAL_SPEED, WALK_MAX_SLOPE } from "../../utils/Constants";
import { snapVecToHeightmap } from "../../utils/WorldUtils";
import { movementStateRef, MovementUpdateFunction } from "../PlayerMovement";

const isUnderground = (vec: Vector3, terrainData: ITerrainData) => {
    if (!terrainData.getHeightAtCoordinates) return false;
    return vec.y < terrainData.getHeightAtCoordinates(vec.x, vec.z);
}

export const doWalking: MovementUpdateFunction = (deltaS, mesh, terrainData, scene, createPhysicsImpostor) => {

    const FORWARD = keyObject.metaDownKeys['FORWARD'];
    const BACK = keyObject.metaDownKeys['BACK'];
    const LEFT = keyObject.metaDownKeys['LEFT'];
    const RIGHT = keyObject.metaDownKeys['RIGHT'];

    const displacementVec = new Vector3()

    if (!scene.activeCamera) return
    const forwardVec = scene.activeCamera.getForwardRay().direction
    forwardVec.normalize()
    const rightVec = forwardVec.cross(Vector3.Up()).scale(-1)

    if (FORWARD) displacementVec.addInPlace(forwardVec.scale(deltaS * LATERAL_SPEED * +FORWARD))
    if (BACK) displacementVec.addInPlace(forwardVec.scale(-deltaS * LATERAL_SPEED * +BACK));
    if (LEFT) displacementVec.addInPlace(rightVec.scale(-deltaS * LATERAL_SPEED * +LEFT));
    if (RIGHT) displacementVec.addInPlace(rightVec.scale(deltaS * LATERAL_SPEED * +RIGHT));

    const newVec = mesh.position.add(displacementVec)
    snapVecToHeightmap(terrainData, newVec, 0.5)


    const delta = newVec.subtract(mesh.position)
    if (!delta.equals(Vector3.Zero()) && !isUnderground(mesh.position, terrainData)) {
        if (delta.y / new Vector2(delta.x, delta.z).length() > WALK_MAX_SLOPE) return;
    }


    mesh.position = newVec;

    //STATE TRANSITIONS
    const UP = keyObject.metaDownKeys['JUMP'];
    if (UP && !mesh.physicsImpostor) {
        const newPhysicsImpostor = createPhysicsImpostor();
        if (!newPhysicsImpostor) return;
        mesh.physicsImpostor = newPhysicsImpostor;
        mesh.physicsImpostor.applyImpulse(new Vector3(0, 10, 0).add(displacementVec.scale(1 / deltaS)), mesh.getAbsolutePosition())
        movementStateRef.current = "falling"
    }
}