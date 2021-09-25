import { keyObject } from "../../containers/ControlsContext";
import { extractBasis, orthoganalProjection } from "../../utils/MathUtils";
import { MovementUpdateFunction } from "../PlayerMovement";

const VELOCITY_CONVERSION_RATE = 1;
const VELOCITY_CONVERSION_FACTOR = 0.5;
const MAX_VELOCITY_CONVERSION = 10;
const DRAG = 0.1

export const doFlying: MovementUpdateFunction = (deltaS, mesh, terrainData, scene) => {
    if (!scene.activeCamera || !mesh.physicsImpostor || !mesh.rotationQuaternion) return

    const xDelta = keyObject.keyDeltas["lookX"]
    const yDelta = keyObject.keyDeltas["lookY"]

    const { forward, right } = extractBasis(mesh.rotationQuaternion);
    mesh.rotateAround(mesh.getAbsolutePosition(), forward, xDelta * -0.4);
    mesh.rotateAround(mesh.getAbsolutePosition(), right, yDelta * 0.4);

    const velocity = mesh.physicsImpostor.getLinearVelocity()
    if (!velocity) return;

    const nonForwardVelocity = orthoganalProjection(velocity, forward);
    const velocityToConvert = nonForwardVelocity.scale(VELOCITY_CONVERSION_RATE * deltaS)

    velocity.subtractInPlace(velocityToConvert)
    velocity.addInPlace(forward.scale(Math.min(velocityToConvert.length() * VELOCITY_CONVERSION_FACTOR, MAX_VELOCITY_CONVERSION * deltaS)))

    // velocity.addInPlace(velocity.scale(-DRAG * deltaS))
    const UP = keyObject.metaDownKeys["JUMP"];
    if (UP) {
        velocity.addInPlace(forward.scale(50 * deltaS))
    }

    mesh.physicsImpostor.setLinearVelocity(velocity);
}