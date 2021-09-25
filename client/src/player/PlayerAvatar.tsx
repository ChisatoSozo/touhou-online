import { Mesh, TransformNode, Vector3 } from '@babylonjs/core';
import React, { useContext, useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { useModel } from '../hooks/useModel';
import { useOctree } from '../hooks/useOctree';
import { ShadowContext } from '../lights/Sun';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { makeLogarithmic } from '../utils/MeshUtils';
import { avatar } from '../utils/TempConst';
import { PLAYER_POSE_STORE } from './PlayerPoseStore';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PlayerAvatarProps {
    username: string;
}
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ username }) => {
    const scene = useScene()
    const avatarModel = useModel(avatar);
    const octree = useOctree()
    const { addShadowCaster } = useContext(ShadowContext)

    useEffect(() => {
        if (!avatarModel?.mesh || !octree || !scene) return;

        makeLogarithmic(avatarModel.mesh);
        avatarModel.mesh.scaling = new Vector3(0.2, 0.2, 0.2);
        avatarModel.mesh.alwaysSelectAsActiveMesh = true;
        avatarModel.mesh.receiveShadows = true;
        avatarModel.mesh.getChildren(undefined, false).forEach(child => {
            if (child instanceof Mesh) {
                octree.dynamicContent.push(child);
                child.alwaysSelectAsActiveMesh = true
                child.receiveShadows = true;
            }
        })
        octree.dynamicContent.push(avatarModel.mesh);
        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        const avatarTransformNode = new TransformNode("avatarNode", scene)
        avatarTransformNode.position = PLAYER_POSE_STORE[username].root.position
        avatarTransformNode.rotationQuaternion = PLAYER_POSE_STORE[username].root.rotation
        avatarModel.mesh.parent = avatarTransformNode;
        avatarModel.mesh.rotation = new Vector3(0, Math.PI, 0);
        avatarModel.mesh.position = new Vector3(0, -0.2, 0);
        avatarModel.mesh.isVisible = true;
        addShadowCaster(avatarModel.mesh);
    }, [octree, avatarModel, scene, addShadowCaster, username]);


    return null;
    // return (
    //     <>
    //     {pose.headPose && <box scalingDeterminant={1} name="">
    //         <standardMaterial name="" diffuseColor={new Color3(...username.split(',').map((x) => parseFloat(x)))} />
    //     </box>}
    //     {
    //         pose.upperBodyPose &&
    //     }
    //     </>
    // );
};


// useBeforeRender(() => {
//     if (!ikAvatar) return;
//     const avatarRig = rig?.current || rigProto(state?.rig);
//     if (!avatarRig) return;
//     if (rig) {
//         if (!rig.current) return;
//         ikAvatar.setPosition(rig.current.head.position, !!xrCamera);
//         ikAvatar.setRotation(rig.current.head.rotation.y);
//         if (rig.current.rightHand?.position) ikAvatar.solveArm('right', rig.current.rightHand.position);
//         if (rig.current.leftHand?.position) ikAvatar.solveArm('left', rig.current.leftHand.position);
//     } else {
//         if (!state) return;
//         if (!state.rig?.head?.position) return;
//         if (!state.rig?.head?.orientation) return;

//         console.log(state.rig.head.orientation);

//         ikAvatar.setPosition(vecProto(state.rig.head.position), true);
//         ikAvatar.setRotation((eulerProto(state.rig.head.orientation) as Vector3).y);
//         if (state.rig?.righthand?.position) ikAvatar.solveArm('right', vecProto(state.rig.righthand.position));
//         if (state.rig?.lefthand?.position) ikAvatar.solveArm('left', vecProto(state.rig.lefthand.position));
//     }
// });