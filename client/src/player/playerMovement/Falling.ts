import { keyObject } from "../../containers/ControlsContext";
import { DOUBLE_TAP_TIMING } from "../../utils/Constants";
import { movementStateRef, MovementUpdateFunction } from "../PlayerMovement";

let lastSpace = new Date()

export const doFalling: MovementUpdateFunction = (deltaS, mesh) => {

    const UP = keyObject.keyDeltas['JUMP'];
    if (UP > 0) {
        const now = new Date()
        if (now.valueOf() - lastSpace.valueOf() < DOUBLE_TAP_TIMING) {
            movementStateRef.current = "floating"
            if (!mesh.physicsImpostor) return;
            mesh.physicsImpostor.dispose()
            mesh.physicsImpostor = null;
        }
        lastSpace = now;
    }
}