import { Matrix, Mesh, MultiMaterial } from "@babylonjs/core";
import { MAX_MESH_IN_INSTANCES } from "./Constants";
import { LOG_DEPTH } from "./Switches";

const makeBuffer = () => {
    const buffer = new Float32Array(MAX_MESH_IN_INSTANCES * 16);
    const identity = Matrix.Identity();
    const sourceBuffer = identity.toArray()
    for (let i = 0; i < MAX_MESH_IN_INSTANCES * 16; i++) {
        const sourceIndex = i % 16;
        buffer[i] = sourceBuffer[sourceIndex];
    }
    return buffer
}

const bufferMatricesPreCompute = makeBuffer();

export const makeInstances = (mesh: Mesh, num: number) => {
    if (num > MAX_MESH_IN_INSTANCES) throw new Error('MAX_MESH_IN_INSTANCES is ' + MAX_MESH_IN_INSTANCES + ' You have ' + num);
    mesh.thinInstanceSetBuffer('matrix', bufferMatricesPreCompute.slice(0, num * 16), 16, true);
};

export const _makeLogarithmic = (mesh: Mesh) => {
    const material = mesh.material;
    if (!material) return;

    if (material instanceof MultiMaterial) {
        material.subMaterials.forEach(subMaterial => {
            //@ts-ignore
            subMaterial.useLogarithmicDepth = LOG_DEPTH;
        })
    }
    else {
        //@ts-ignore
        material.useLogarithmicDepth = LOG_DEPTH
    }
}
export const makeLogarithmic = (mesh: Mesh) => {
    _makeLogarithmic(mesh);
    mesh.getChildren(undefined, false).forEach(child => {
        if (child instanceof Mesh) {
            makeLogarithmic(child);
        }
    })
}