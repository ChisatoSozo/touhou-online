import { keyObject } from "../../containers/ControlsContext";
import { extractBasis, orthoganalProjection } from "../../utils/MathUtils";
import { MovementUpdateFunction } from "../PlayerMovement";

const VELOCITY_CONVERSION_RATE = 1;
const VELOCITY_CONVERSION_FACTOR = 0.7;

export const doFlying: MovementUpdateFunction = (deltaS, mesh, ground, head, scene) => {
    if (!scene.activeCamera || !mesh.physicsImpostor || !mesh.rotationQuaternion) return

    const xDelta = keyObject.keyDeltas["lookX"]
    const yDelta = keyObject.keyDeltas["lookY"]

    const { forward, right } = extractBasis(mesh.rotationQuaternion);
    mesh.rotateAround(mesh.getAbsolutePosition(), forward, xDelta * -0.4);
    mesh.rotateAround(mesh.getAbsolutePosition(), right, yDelta * 0.4);

    const forwardVec = scene.activeCamera.getForwardRay().direction
    forwardVec.normalize()
    const velocity = mesh.physicsImpostor.getLinearVelocity()
    if (!velocity) return;
    const nonForwardVelocity = orthoganalProjection(velocity, forwardVec);
    const velocityToConvert = nonForwardVelocity.scale(VELOCITY_CONVERSION_RATE * deltaS)

    velocity.subtractInPlace(velocityToConvert)
    velocity.addInPlace(forwardVec.scale(velocityToConvert.length() * VELOCITY_CONVERSION_FACTOR))
    mesh.physicsImpostor.setLinearVelocity(velocity);

    const UP = keyObject.metaDownKeys["JUMP"];
    if (UP) {
        mesh.physicsImpostor.applyForce(forwardVec.scale(100), mesh.getAbsolutePosition());
    }
}