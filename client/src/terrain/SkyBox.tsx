import { Color3, Mesh, Texture } from '@babylonjs/core'
import React, { MutableRefObject, useRef } from 'react'
import { useBeforeRender, useScene } from 'react-babylonjs'
import { useDynamicOctreeRef } from '../containers/OctreeContext'

interface SkyBoxProps {
    skyBoxRef?: MutableRefObject<Mesh | undefined>
}

export const SkyBox: React.FC<SkyBoxProps> = ({ skyBoxRef }) => {

    const scene = useScene()
    const internalSkyBoxRef = useRef<Mesh>()

    useDynamicOctreeRef(skyBoxRef || internalSkyBoxRef)

    useBeforeRender(() => {
        const ref = skyBoxRef || internalSkyBoxRef
        if (!ref?.current || !scene?.activeCamera) return;
        ref.current.position.copyFrom(scene.activeCamera.globalPosition.scale(0.8))
    })

    return (
        <box ref={skyBoxRef || internalSkyBoxRef} applyFog={false} name="skybox" size={10000}>
            <standardMaterial name="skyMat" disableLighting={true} backFaceCulling={false} diffuseColor={new Color3(0, 0, 0)} specularColor={new Color3(0, 0, 0)}>
                <cubeTexture name="skyTexture" assignTo="reflectionTexture" coordinatesMode={Texture.SKYBOX_MODE} rootUrl="/terrain/skybox/TropicalSunnyDay" />
            </standardMaterial>
        </box>
    )
}
