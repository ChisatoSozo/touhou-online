import { Matrix, Quaternion, Vector3 } from "@babylonjs/core";

export const modRange = (number: number, max: number, min: number) => {
    return ((number - min) % (max - min)) + min
}

export const modDist = (a: number, b: number, mod: number) => {
    const diff = Math.abs(b - a);
    const sign = Math.sign(b - a);

    return (diff < (mod / 2)) ? sign * diff : -sign * (mod - diff);
}

export const orthoganalProjection = (vec: Vector3, forward: Vector3) => {
    const projection = forward.scale(Vector3.Dot(vec, forward))
    return vec.subtract(projection);
}

export const extractBasis = (quat: Quaternion) => {
    const matrix = new Matrix();
    quat.toRotationMatrix(matrix);
    return {
        up: Vector3.TransformCoordinates(Vector3.Up(), matrix),
        right: Vector3.TransformCoordinates(Vector3.Right(), matrix),
        forward: Vector3.TransformCoordinates(Vector3.Forward(), matrix),
    }
}