import { Quaternion, Vector3 } from '@babylonjs/core';
import { InternalRig } from '../hooks/useRig';
import { Pose, Quaternion4D, Rig, Vector3D } from '../protos/touhou_pb';

export const protoVec = (vector?: Vector3) => {
    if (!vector) return;
    const vecP = new Vector3D();
    vecP.setX(vector.x);
    vecP.setY(vector.y);
    vecP.setZ(vector.z);
    return vecP;
};

export const protoEuler = (euler?: Vector3) => {
    if (!euler) return;
    const quat = Quaternion.FromEulerAngles(euler.x, euler.y, euler.z);
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
    const headPose = new Pose();
    const leftHandPose = new Pose();
    const rightHandPose = new Pose();
    headPose.setPosition(protoVec(rig.head.position));
    headPose.setOrientation(protoEuler(rig.head.rotation));
    leftHandPose.setPosition(protoVec(rig.leftHand?.position));
    leftHandPose.setOrientation(protoEuler(rig.leftHand?.rotation));
    rightHandPose.setPosition(protoVec(rig.rightHand?.position));
    rightHandPose.setOrientation(protoEuler(rig.rightHand?.rotation));
    rigP.setHead(headPose);
    rigP.setLefthand(leftHandPose);
    rigP.setRighthand(rightHandPose);
    return rigP;
};

export const vecProto = (vector?: Vector3D.AsObject) => {
    if (!vector) return Vector3.Zero();
    return new Vector3(vector.x, vector.y, vector.z);
};

export const eulerProto = (quaternionP?: Quaternion4D.AsObject) => {
    if (!quaternionP) return;
    const quaternion = new Quaternion(quaternionP.x, quaternionP.y, quaternionP.z, quaternionP.w);
    return quaternion.toEulerAngles();
};

export const rigProto = (rig?: Rig.AsObject) => {
    if (!rig) return;
    return {
        head: {
            position: vecProto(rig?.head?.position),
            rotation: eulerProto(rig.head?.orientation),
        },
        leftHand:
            rig.lefthand?.position && rig.lefthand.orientation
                ? {
                      position: vecProto(rig.lefthand.position) as Vector3,
                      rotation: eulerProto(rig.lefthand.orientation) as Vector3,
                  }
                : undefined,
        rightHand:
            rig.righthand?.position && rig.righthand.orientation
                ? {
                      position: vecProto(rig.righthand.position) as Vector3,
                      rotation: eulerProto(rig.righthand.orientation) as Vector3,
                  }
                : undefined,
    };
};
