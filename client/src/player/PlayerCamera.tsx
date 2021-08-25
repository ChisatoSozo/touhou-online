import { Color3, Matrix, Quaternion, Texture, Vector3 } from '@babylonjs/core';
import React, { useRef } from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { keyObject } from '../containers/ControlsContext';

export const PlayerCamera = () => {
    const cameraRef = useRef();

    useBeforeRender(() => {
        if (!cameraRef.current) return;

        const upM = Matrix.RotationX(keyObject.metaDownKeys.lookY);
        const rightM = Matrix.RotationY(keyObject.metaDownKeys.lookX);

        const matrix = Matrix.Identity().multiply(upM).multiply(rightM);

        const _ = new Vector3();
        const rotation = new Quaternion();

        matrix.decompose(_, rotation);

        //@ts-ignore
        cameraRef.current.rotationQuaternion = rotation;
    });

    return (
        <>
            <box name="skybox" size={1000}>
                <standardMaterial name="skyMat" disableLighting={true} backFaceCulling={false} diffuseColor={new Color3(0, 0, 0)} specularColor={new Color3(0, 0, 0)}>
                    <cubeTexture name="skyTexture" assignTo="reflectionTexture" coordinatesMode={Texture.SKYBOX_MODE} rootUrl="/terrain/skybox/TropicalSunnyDay" />
                </standardMaterial>
            </box>
            <transformNode name="cameraTransform" ref={cameraRef} position={new Vector3(0, 1.88, 0)}>
                <targetCamera fov={1.0472} name="camera" minZ={0.01} maxZ={1000} position={new Vector3(0, 0, 0)} />
            </transformNode>
        </>
    );
};
