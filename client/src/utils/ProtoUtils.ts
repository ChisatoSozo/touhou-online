import { Quaternion, Vector3 } from '@babylonjs/core';
import { InternalRig } from '../player/PlayerPoseStore';
import { Pose, Quaternion4D, Rig, Vector3D } from '../protos/touhou_pb';

export const protoVec = (vector?: Vector3) => {
    if (!vector) return;
    const vecP = new Vector3D();
    vecP.setX(vector.x);
    vecP.setY(vector.y);
    vecP.setZ(vector.z);
    return vecP;
};

export const protoQuat = (quat?: Quaternion) => {
    if (!quat) return;
    const quatP = new Quaternion4D();
    quatP.setX(quat.x);
    quatP.setY(quat.y);
    quatP.setZ(quat.z);
    quatP.setW(quat.w);
    return quatP;
};

export const protoRig = (rig: InternalRig | undefined) => {
    if (!rig) return;
    const rigP = new Rig();
    const rootPose = new Pose();
    const headPose = new Pose();
    const leftHandPose = new Pose();
    const rightHandPose = new Pose();
    rootPose.setPosition(protoVec(rig.root.position));
    rootPose.setOrientation(protoQuat(rig.root.rotation));
    headPose.setPosition(protoVec(rig.head?.position));
    headPose.setOrientation(protoQuat(rig.head?.rotation));
    leftHandPose.setPosition(protoVec(rig.leftHand?.position));
    leftHandPose.setOrientation(protoQuat(rig.leftHand?.rotation));
    rightHandPose.setPosition(protoVec(rig.rightHand?.position));
    rightHandPose.setOrientation(protoQuat(rig.rightHand?.rotation));
    rigP.setHead(headPose);
    rigP.setLefthand(leftHandPose);
    rigP.setRighthand(rightHandPose);
    return rigP;
};

export const vecProto = (vector?: Vector3D.AsObject) => {
    if (!vector) return;
    return new Vector3(vector.x, vector.y, vector.z);
};

export const quatProto = (quaternionP?: Quaternion4D.AsObject) => {
    if (!quaternionP) return;
    const quaternion = new Quaternion(quaternionP.x, quaternionP.y, quaternionP.z, quaternionP.w);
    return quaternion;
};

export const rigProto: (rig?: Rig.AsObject) => InternalRig | undefined = (rig) => {
    if (!rig?.root || !rig?.head) return;
    return {
        root: {
            position: vecProto(rig.root.position) as Vector3,
            rotation: quatProto(rig.root.orientation) as Quaternion,
        },
        head: {
            position: vecProto(rig.head.position) as Vector3,
            rotation: quatProto(rig.head.orientation) as Quaternion,
        },
        leftHand:
            rig.lefthand?.position && rig.lefthand.orientation
                ? {
                    position: vecProto(rig.lefthand.position) as Vector3,
                    rotation: quatProto(rig.lefthand.orientation) as Quaternion,
                }
                : undefined,
        rightHand:
            rig.righthand?.position && rig.righthand.orientation
                ? {
                    position: vecProto(rig.righthand.position) as Vector3,
                    rotation: quatProto(rig.righthand.orientation) as Quaternion,
                }
                : undefined,
    };
};
