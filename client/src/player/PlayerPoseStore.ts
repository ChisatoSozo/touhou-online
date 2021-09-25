import { Quaternion, Vector3 } from "@babylonjs/core";
import { username } from "../utils/TempConst";

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

const createRig: () => InternalRig = () => ({
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

interface PlayerPoseNetworkStoreType {
    [username: string]: InternalRig & { timestamp: number };
}

export const PLAYER_POSE_TARGET_STORE: PlayerPoseNetworkStoreType = {
}

export const PLAYER_POSE_LAST_STORE: PlayerPoseNetworkStoreType = {
}

export const PLAYER_POSE_STORE: PlayerPoseStoreType = {
    [username.current]: createRig()
}

export const TEST_POS = PLAYER_POSE_STORE[username.current].root.position

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
    return PLAYER_POSE_STORE[username.current].root.position.clone()
}
export const getPlayerPositionRef = () => {
    return PLAYER_POSE_STORE[username.current].root.position
}