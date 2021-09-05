import { Quaternion, Vector3 } from "@babylonjs/core";

export interface Pose {
    rotation: Quaternion;
    position: Vector3;
}

export interface InternalRig {
    root: Pose;
    head: Pose;
    leftHand?: Pose;
    rightHand?: Pose;
}

interface PlayerPoseStoreType {
    [username: string]: InternalRig;
}

export const PLAYER_POSE_STORE: PlayerPoseStoreType = {}