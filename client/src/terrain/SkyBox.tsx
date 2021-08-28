import { Color3, Mesh, Texture } from '@babylonjs/core'
import React, { useRef } from 'react'
import { useBeforeRender, useScene } from 'react-babylonjs'


export const SkyBox = () => {

    const skyBoxRef = useRef<Mesh>()
    const scene = useScene()

    useBeforeRender(() => {
        if (!skyBoxRef.current || !scene?.activeCamera) return;
        skyBoxRef.current.position.copyFrom(scene.activeCamera.globalPosition.scale(0.8))
    })

    return (
        <box ref={skyBoxRef} applyFog={false} name="skybox" size={10000}>
            <standardMaterial name="skyMat" disableLighting={true} backFaceCulling={false} diffuseColor={new Color3(0, 0, 0)} specularColor={new Color3(0, 0, 0)}>
                <cubeTexture name="skyTexture" assignTo="reflectionTexture" coordinatesMode={Texture.SKYBOX_MODE} rootUrl="/terrain/skybox/TropicalSunnyDay" />
            </standardMaterial>
        </box>
    )
}
