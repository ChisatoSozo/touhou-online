import { Quaternion, Vector3 } from "@babylonjs/core";
import { keyObject } from "../../containers/ControlsContext";
import { DOUBLE_TAP_TIMING, LATERAL_SPEED } from "../../utils/Constants";
import { movementStateRef, MovementUpdateFunction } from "../PlayerMovement";

let lastDown = new Date()
let lastForwards = new Date()

export const doFloating: MovementUpdateFunction = (deltaS, mesh, terrainData, head, scene, createPhysicsImpostor) => {
    if (!terrainData.getHeightAtCoordinates) return;

    const FORWARD = keyObject.metaDownKeys['FORWARD'];
    const BACK = keyObject.metaDownKeys['BACK'];
    const LEFT = keyObject.metaDownKeys['LEFT'];
    const RIGHT = keyObject.metaDownKeys['RIGHT'];
    const UP = keyObject.metaDownKeys['JUMP'];
    const DOWN = keyObject.metaDownKeys['CROUCH'];

    const displacementVec = new Vector3()

    if (!scene.activeCamera) return
    const forwardVec = scene.activeCamera.getForwardRay().direction.clone();
    forwardVec.y = 0;
    forwardVec.normalize()
    const rightVec = forwardVec.cross(Vector3.Up()).scale(-1)

    if (FORWARD) displacementVec.addInPlace(forwardVec.scale(deltaS * LATERAL_SPEED * +FORWARD))
    if (BACK) displacementVec.addInPlace(forwardVec.scale(-deltaS * LATERAL_SPEED * +BACK));
    if (LEFT) displacementVec.addInPlace(rightVec.scale(-deltaS * LATERAL_SPEED * +LEFT));
    if (RIGHT) displacementVec.addInPlace(rightVec.scale(deltaS * LATERAL_SPEED * +RIGHT));
    if (UP) displacementVec.addInPlace(Vector3.Up().scale(deltaS * LATERAL_SPEED * +UP));
    if (DOWN) displacementVec.addInPlace(Vector3.Up().scale(-deltaS * LATERAL_SPEED * +DOWN));

    const newVec = mesh.position.add(displacementVec)
    mesh.position = newVec;

    //STATE TRANSITIONS
    const y = terrainData.getHeightAtCoordinates(newVec.x, newVec.z)
    if (newVec.y < y) {
        movementStateRef.current = "walking";
    }

    const dDOWN = keyObject.keyDeltas['CROUCH'];
    if (dDOWN > 0) {
        const now = new Date()
        if (now.valueOf() - lastDown.valueOf() < DOUBLE_TAP_TIMING) {
            const newPhysicsImpostor = createPhysicsImpostor();
            if (!newPhysicsImpostor) return;
            mesh.physicsImpostor = newPhysicsImpostor;
            movementStateRef.current = "falling"
        }
        lastDown = now;
    }

    const dFORWADS = keyObject.keyDeltas['FORWARD'];
    if (dFORWADS > 0) {
        const now = new Date()
        if (now.valueOf() - lastForwards.valueOf() < DOUBLE_TAP_TIMING) {
            if (!head.rotationQuaternion) return;
            // mesh.setAbsolutePosition(scene.activeCamera.position)
            mesh.rotationQuaternion = head.rotationQuaternion.clone();
            head.rotationQuaternion = new Quaternion();
            mesh.setAbsolutePosition(head.getAbsolutePosition().clone());
            head.position = new Vector3(0, 0, 0);

            const newPhysicsImpostor = createPhysicsImpostor();
            if (!newPhysicsImpostor) return;
            mesh.physicsImpostor = newPhysicsImpostor;
            mesh.physicsImpostor.applyImpulse(forwardVec.scale(10), mesh.getAbsolutePosition())
            movementStateRef.current = "flying"
        }
        lastForwards = now;
    }
}