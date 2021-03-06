import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { useBeforeRender } from 'react-babylonjs';
import { LS } from '../containers/LSContext';
import { cloneRig, InternalRig, PLAYER_DATA_STORE, PLAYER_POSE_LAST_STORE, PLAYER_POSE_STORE, PLAYER_POSE_TARGET_STORE } from '../player/PlayerPoseStore';
import { WorldState } from '../protos/touhou_pb';
import { rigProto } from '../utils/ProtoUtils';


export const useSolveWorldState = (worldState?: WorldState.AsObject) => {
    useBeforeRender(() => {
        for (const curUsername in PLAYER_POSE_STORE) {
            if (curUsername === LS.current.USERNAME) continue;
            if (!PLAYER_POSE_LAST_STORE[curUsername] || !PLAYER_POSE_TARGET_STORE[curUsername]) return;

            const last = PLAYER_POSE_LAST_STORE[curUsername];
            const target = PLAYER_POSE_TARGET_STORE[curUsername]

            const curDelta = performance.now() - target.timestamp;
            const timestep = target.timestamp - last.timestamp;
            const alpha = curDelta / timestep;

            for (const poseString in PLAYER_POSE_STORE[curUsername]) {
                const poseProp = poseString as keyof InternalRig;
                const lastPosition = last[poseProp]?.position;
                const lastRotation = last[poseProp]?.rotation;
                const targetPosition = target[poseProp]?.position;
                const targetRotation = target[poseProp]?.rotation;
                if (!lastPosition || !lastRotation || !targetPosition || !targetRotation) return;

                const position = Vector3.Lerp(lastPosition, targetPosition, alpha);
                const rotation = Quaternion.Slerp(lastRotation, targetRotation, alpha).normalize();

                PLAYER_POSE_STORE[curUsername][poseProp]?.position.copyFrom(position)
                PLAYER_POSE_STORE[curUsername][poseProp]?.rotation.copyFrom(rotation)
            }
        }
    })

    if (!worldState) return;

    const usernames: string[] = [];
    worldState.playersList.forEach((player) => {
        if (player.username === LS.current.USERNAME) return;
        const { username: curUsername, rig: protoRig, ...rest } = player;
        const rig = rigProto(protoRig)
        if (!rig) return;

        usernames.push(curUsername);

        if (!PLAYER_POSE_STORE[curUsername]) {
            console.log(`${curUsername} has joined the game!`)
            PLAYER_DATA_STORE[curUsername] = rest
            PLAYER_POSE_STORE[curUsername] = cloneRig(rig);
            PLAYER_POSE_LAST_STORE[curUsername] = { ...cloneRig(rig), timestamp: performance.now() - 20000 };
            PLAYER_POSE_TARGET_STORE[curUsername] = { ...cloneRig(rig), timestamp: performance.now() - 10000 };
        }
        PLAYER_POSE_LAST_STORE[curUsername] = { ...cloneRig(PLAYER_POSE_STORE[curUsername]), timestamp: PLAYER_POSE_TARGET_STORE[curUsername].timestamp }
        PLAYER_POSE_TARGET_STORE[curUsername] = { ...cloneRig(rig), timestamp: performance.now() };

        //Sync every data cycle
        Object.assign(PLAYER_DATA_STORE[curUsername], rest)
    })

    for (const curUsername in PLAYER_POSE_STORE) {
        if (!usernames.includes(curUsername) && curUsername !== LS.current.USERNAME) {
            console.log(`${curUsername} has left the game!`)
            delete PLAYER_POSE_STORE[curUsername]
        }
    }
}
