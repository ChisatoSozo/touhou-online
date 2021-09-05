import { Mesh, Vector3 } from '@babylonjs/core';
import React, { useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { useModel } from '../hooks/useModel';
import { useOctree } from '../hooks/useOctree';
import { MAX_MESHES_IN_SCENE } from '../utils/Constants';
import { makeLogarithmic } from '../utils/MeshUtils';
import { avatar } from '../utils/TempConst';
import { PLAYER_POSE_STORE } from './PlayerPoseStore';

// const tempDef: AvatarDefinition = {
//     ikDefinition: {
//         leftShoulderBone: 'bone13',
//         leftElbowBone: 'bone14',
//         leftWristBone: 'bone15',

//         rightShoulderBone: 'bone32',
//         rightElbowBone: 'bone33',
//         rightWristBone: 'bone34',
//     },
//     viewHeight: 1.88,
// };

interface PlayerAvatarProps {
    username: string;
}
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ username }) => {
    const scene = useScene()
    const avatarModel = useModel(avatar);
    const octree = useOctree()

    useEffect(() => {
        if (!avatarModel?.mesh || !octree || !scene) return;

        makeLogarithmic(avatarModel.mesh);
        avatarModel.mesh.scaling = new Vector3(0.3, 0.3, 0.3);
        avatarModel.mesh.alwaysSelectAsActiveMesh = true;
        avatarModel.mesh.getChildren(undefined, false).forEach(child => {
            if (child instanceof Mesh) {
                octree.dynamicContent.push(child);
                child.alwaysSelectAsActiveMesh = true
            }
        })
        octree.dynamicContent.push(avatarModel.mesh);
        scene.createOrUpdateSelectionOctree(MAX_MESHES_IN_SCENE)
        avatarModel.mesh.position = PLAYER_POSE_STORE[username].root.position
        avatarModel.mesh.rotationQuaternion = PLAYER_POSE_STORE[username].root.rotation
    }, [octree, avatarModel, scene, username]);



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