import { AbstractMesh, AssetContainer, TransformNode, Vector3 } from '@babylonjs/core';
import React, { useEffect, useRef, useState } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { InternalRig } from '../hooks/useRig';
import { useHands, useXRCamera } from '../hooks/useXR';
import { PlayerState } from '../protos/touhou_pb';
import { eulerProto, rigProto, vecProto } from '../utils/ProtoUtils';
import { CREATIVE } from '../utils/Switches';
import IKAvatar, { AvatarDefinition } from './IK/IKAvatar';

export interface UpperBodyPose {
    head: Vector3;
    leftHand: Vector3;
    rightHand: Vector3;
}

export interface Pose {
    upperBodyPose?: UpperBodyPose;
    headPose?: Vector3;
}

const tempDef: AvatarDefinition = {
    ikDefinition: {
        leftShoulderBone: 'bone13',
        leftElbowBone: 'bone14',
        leftWristBone: 'bone15',

        rightShoulderBone: 'bone32',
        rightElbowBone: 'bone33',
        rightWristBone: 'bone34',
    },
    viewHeight: 1.88,
};

interface PlayerAvatarProps {
    assetContainer?: AssetContainer;
    rig?: React.MutableRefObject<InternalRig | undefined>;
    state?: PlayerState.AsObject;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ assetContainer, rig, state }) => {
    const scene = useScene();
    const transformNodeRef = useRef<TransformNode>();

    const xrCamera = useXRCamera();
    const hands = useHands();

    const [ikAvatar, setIkAvatar] = useState<IKAvatar>();

    useEffect(() => {
        if (!transformNodeRef.current || !scene || !assetContainer) return;
        if (CREATIVE) return;
        const newMesh = assetContainer.instantiateModelsToScene();

        const mesh = newMesh.rootNodes[0] as AbstractMesh;
        mesh.scaling = new Vector3(0.028, 0.028, 0.028);
        const skeleton = newMesh.skeletons[0];
        const loadedMesh = mesh;

        scene.stopAllAnimations();

        const ikAvatar = new IKAvatar(scene, mesh, skeleton, tempDef);
        setIkAvatar(ikAvatar);

        return () => {
            if (loadedMesh) loadedMesh.dispose();
            setIkAvatar(undefined);
        };
    }, [assetContainer, scene]);

    useBeforeRender(() => {
        if (!ikAvatar) return;
        const avatarRig = rig?.current || rigProto(state?.rig);
        if (!avatarRig) return;
        if (rig) {
            if (!rig.current) return;
            ikAvatar.setPosition(rig.current.head.position, !!xrCamera);
            ikAvatar.setRotation(rig.current.head.rotation.y);
            if (rig.current.rightHand?.position) ikAvatar.solveArm('right', rig.current.rightHand.position);
            if (rig.current.leftHand?.position) ikAvatar.solveArm('left', rig.current.leftHand.position);
        } else {
            if (!state) return;
            if (!state.rig?.head?.position) return;
            if (!state.rig?.head?.orientation) return;

            console.log(state.rig.head.orientation);

            ikAvatar.setPosition(vecProto(state.rig.head.position), true);
            ikAvatar.setRotation((eulerProto(state.rig.head.orientation) as Vector3).y);
            if (state.rig?.righthand?.position) ikAvatar.solveArm('right', vecProto(state.rig.righthand.position));
            if (state.rig?.lefthand?.position) ikAvatar.solveArm('left', vecProto(state.rig.lefthand.position));
        }
    });

    return <transformNode name="avatar" ref={transformNodeRef} />;
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
