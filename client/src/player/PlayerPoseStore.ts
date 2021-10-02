import { Quaternion, Vector3 } from "@babylonjs/core";
import { LS } from "../containers/LSContext";
import { AttackState, AttackStateMap, Avatar, AvatarMap } from "../protos/touhou_pb";

export interface Pose {
    readonly rotation: Quaternion;
    readonly position: Vector3;
}

export interface InternalRig {
    root: Pose;
    head: Pose;
    leftHand?: Pose;
    rightHand?: Pose;
}

export const createRig: () => InternalRig = () => ({
    head: {
        position: new Vector3(0, 1.88, 0),
        rotation: new Quaternion()
    },
    root: {
        position: new Vector3(),
        rotation: new Quaternion()
    },
})

interface PlayerPoseStoreType {
    [username: string]: InternalRig;
}

export interface PlayerData {
    avatar: AvatarMap[keyof AvatarMap]
    attackState: AttackStateMap[keyof AttackStateMap]
}

export const createPlayerData: () => PlayerData = () => ({
    avatar: Avatar.REIMU,
    attackState: AttackState.NOT_ATTACKING
})

interface PlayerDataStoreType {
    [username: string]: {
        avatar: AvatarMap[keyof AvatarMap]
        attackState: AttackStateMap[keyof AttackStateMap]
        socketId?: string
    };
}


interface PlayerPoseNetworkStoreType {
    [username: string]: InternalRig & { timestamp: number };
}

export const PLAYER_POSE_TARGET_STORE: PlayerPoseNetworkStoreType = {
}

export const PLAYER_POSE_LAST_STORE: PlayerPoseNetworkStoreType = {
}

export const PLAYER_POSE_STORE: PlayerPoseStoreType = {
}
export const PLAYER_DATA_STORE: PlayerDataStoreType = {
}

export const cloneRig = (rig: InternalRig) => {
    const newRig = createRig()
    for (const poseString in rig) {
        const poseProp = poseString as keyof InternalRig;
        if (!rig[poseProp]) continue;

        const sourcePose = rig[poseProp] as Pose;

        newRig[poseProp] = {
            position: sourcePose.position.clone(),
            rotation: sourcePose.rotation.clone()
        }
    }
    return newRig;
}

export const getPlayerPosition = () => {
    return PLAYER_POSE_STORE[LS.current.USERNAME].root.position.clone()
}
export const getPlayerPositionRef = () => {
    return PLAYER_POSE_STORE[LS.current.USERNAME].root.position
}