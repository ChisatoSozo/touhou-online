import { grpc } from '@improbable-eng/grpc-web';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LS } from '../containers/LSContext';
import { Empty, PlayerState, Rig, WorldState } from '../protos/touhou_pb';
import { TouhouClient } from '../protos/touhou_pb_service';
import { ONLINE } from '../utils/Switches';
import { setupSockets } from '../voice/setupSockets';

export const useVoiceChat = () => {
    useEffect(() => {
        setupSockets()
    }, [])

    const voiceUsers = useRef<{ [key: string]: boolean }>({})
    // const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({})
    // useMemo(() => {
    //     localStorage.debug = '*';


    //     const newStream = ({ streams: [stream] }: { streams: MediaStream[] }) => {
    //         const audioEl = document.createElement("audio");
    //         document.body.appendChild(audioEl);
    //         audioEl.srcObject = stream;
    //         audioEl.play();
    //     };

    //     const callUser = async (socketId: string) => {
    //         const offer = await peerConnection.createOffer();
    //         voiceUsers.current[socketId] = true

    //         await peerConnections.current[socketId].setLocalDescription(new RTCSessionDescription(offer));

    //         socket.emit("call-user", {
    //             offer,
    //             to: socketId
    //         });

    //     }

    //     socket.onAny(console.log)
    //     socket.on("update-user-list", ({ users }: { users: string[] }) => {
    //         users.forEach(user => {
    //             if (!(user in voiceUsers)) {
    //                 voiceUsers.current[user] = false;
    //                 peerConnections.current[user] = new RTCPeerConnection();
    //                 //@ts-ignore
    //                 peerConnections.current[user].ontrack = newStream
    //                 if (socket.id > user) return;
    //                 callUser(user)
    //             }
    //         })
    //     });

    //     socket.on("remove-user", ({ socketId }) => {
    //         delete voiceUsers.current[socketId]
    //         delete peerConnections.current[socketId]
    //     });

    //     socket.on("call-made", async data => {
    //         await peerConnection.setRemoteDescription(
    //             new RTCSessionDescription(data.offer)
    //         );
    //         const answer = await peerConnection.createAnswer();
    //         await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    //         socket.emit("make-answer", {
    //             answer,
    //             to: data.socket
    //         });
    //     });

    //     socket.on("answer-made", async data => {
    //         await peerConnection.setRemoteDescription(
    //             new RTCSessionDescription(data.answer)
    //         );
    //         if (voiceUsers.current[data.socket as string]) return;
    //         callUser(data.socket);
    //     });

    //     socket.on("call-rejected", data => {
    //         alert(`User: "Socket: ${data.socket}" rejected your call.`);
    //     });

    //     navigator.getUserMedia(
    //         { video: false, audio: true },
    //         stream => {
    //             stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    //         },
    //         error => {
    //             console.warn(error.message);
    //         }
    //     );

    //     return socket
    // }, [voiceUsers]);
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

    const sendUpdate = useCallback(
        (rig?: Rig) => {
            if (!ONLINE) return;
            const playerState = new PlayerState();
            playerState.setUsername(LS.current.USERNAME);
            playerState.setAvatar(LS.current.CHARACTER)
            playerState.setRig(rig);
            playerStateUpdateStream?.write(playerState);
        },
        [playerStateUpdateStream],
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

    useVoiceChat()

    return { sendUpdate, worldState };
};
