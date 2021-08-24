import { grpc } from '@improbable-eng/grpc-web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Empty, PlayerState, Rig, WorldState } from '../protos/touhou_pb';
import { TouhouClient } from '../protos/touhou_pb_service';
import { ONLINE } from '../utils/Switches';

export const useOnline = (url: string, username: string) => {
    const client = useMemo(
        () =>
            new TouhouClient(url, {
                transport: grpc.WebsocketTransport(),
            }),
        [url],
    );
    const playerStateUpdateStream = useMemo(() => (ONLINE ? client.playerStateUpdate() : undefined), [client]);

    const sendUpdate = useCallback(
        (rig?: Rig) => {
            if (!ONLINE) return;
            const playerState = new PlayerState();
            playerState.setUsername(username);
            playerState.setRig(rig);
            playerStateUpdateStream?.write(playerState);
        },
        [playerStateUpdateStream, username],
    );

    const [worldState, setWorldState] = useState<WorldState.AsObject>();
    useEffect(() => {
        if (!ONLINE) return;
        const worldStateUpdateStream = client.worldUpdate(new Empty());
        worldStateUpdateStream.on('data', (newWorldState) => {
            setWorldState(newWorldState.toObject());
        });
    }, [client]);

    return { sendUpdate, worldState };
};
