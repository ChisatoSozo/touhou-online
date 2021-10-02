import { grpc } from '@improbable-eng/grpc-web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LS } from '../containers/LSContext';
import { Empty, PlayerState, Rig, WorldState } from '../protos/touhou_pb';
import { TouhouClient } from '../protos/touhou_pb_service';
import { ONLINE } from '../utils/Switches';
import { useSetupSockets } from '../voice/setupSockets';

export const useVoiceChat = () => {
    const { remoteUsers, socketId: mySocketId } = useSetupSockets();

    useEffect(() => {
        return () => {
            const videos = document.getElementsByTagName("video");
            for (const video of videos) {
                video.parentElement?.removeChild(video)
            }
        }
    }, [])

    return { remoteUsers, mySocketId }
}

export const useOnline = (url: string) => {
    const client = useMemo(
        () =>
            new TouhouClient(url, {
                transport: grpc.WebsocketTransport(),
            }),
        [url],
    );
    const playerStateUpdateStream = useMemo(() => (ONLINE ? client.playerStateUpdate() : undefined), [client]);

    const { remoteUsers, mySocketId } = useVoiceChat()

    const sendUpdate = useCallback(
        (rig?: Rig) => {
            if (!ONLINE) return;
            const playerState = new PlayerState();
            playerState.setUsername(LS.current.USERNAME);
            playerState.setAvatar(LS.current.CHARACTER)
            playerState.setRig(rig);
            if (mySocketId) playerState.setSocketId(mySocketId);
            playerStateUpdateStream?.write(playerState);
        },
        [playerStateUpdateStream, mySocketId],
    );

    const [worldState, setWorldState] = useState<WorldState.AsObject>();
    useEffect(() => {
        if (!ONLINE) return;
        const worldStateUpdateStream = client.worldUpdate(new Empty());
        worldStateUpdateStream.on('data', (newWorldState) => {
            setWorldState(newWorldState.toObject());
        });

        return () => {
            worldStateUpdateStream.cancel();
        }
    }, [client]);

    return { sendUpdate, worldState, mySocketId, remoteUsers };
};
