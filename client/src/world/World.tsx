import React from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { LS } from '../containers/LSContext';
import { useOnline } from '../hooks/useOnline';
import { useSolveWorldState } from '../hooks/useSolveWorldState';
import { Player } from '../player/Player';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { PLAYER_POSE_STORE } from '../player/PlayerPoseStore';
import { Terrain } from '../terrain/Terrain';
import { protoRig } from '../utils/ProtoUtils';

export const World = () => {
    const { sendUpdate, worldState, remoteUsers } = useOnline(`http://${window.location.hostname}:8080`);

    useBeforeRender(() => {
        sendUpdate(protoRig(PLAYER_POSE_STORE[LS.current.USERNAME]));
    });
    useSolveWorldState(worldState)


    return (
        <>
            <Player />
            <Terrain />
            {Object.keys(PLAYER_POSE_STORE).map(
                (player) => <PlayerAvatar key={player} username={player} remoteUsers={remoteUsers} />
            )}
        </>
    );
};
