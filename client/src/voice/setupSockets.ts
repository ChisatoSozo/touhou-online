import { useEffect, useState } from "react";
//@ts-ignore
import io from "socket.io-client";

const { RTCPeerConnection, RTCSessionDescription } = window;



const getStream = () => {
    return new Promise<MediaStream>((resolve, reject) => {
        navigator.getUserMedia(
            { video: false, audio: true },
            stream => {
                resolve(stream)
            },
            error => {
                console.warn(error.message);
            }
        );
    })
}

interface User {
    peerConnection: RTCPeerConnection;
    isAlreadyCalling: boolean;
    getCalled: boolean;
    stream: MediaStream | undefined;
}

export type Users = { [username: string]: User }

const internalRemoteUsers: Users = {};

export const useSetupSockets = () => {

    const [socketId, setSocketId] = useState<string>()
    const [remoteUsers, setRemoteUsers] = useState<Users>({});

    useEffect(() => {
        const getSocket = async () => {
            const stream = await getStream();

            const init = (users: string[]) => {
                users.forEach(user => {
                    if (user in internalRemoteUsers) return;

                    const remoteUser = {
                        peerConnection: new RTCPeerConnection(),
                        isAlreadyCalling: false,
                        getCalled: false,
                        stream: undefined
                    }

                    stream.getTracks().forEach(track => remoteUser.peerConnection.addTrack(track, stream));

                    remoteUser.peerConnection.ontrack = function ({ streams: [stream] }) {
                        internalRemoteUsers[user].stream = stream;
                        setRemoteUsers({ ...internalRemoteUsers })
                        const remoteVideo = document.createElement('video');
                        remoteVideo.autoplay = true;
                        remoteVideo.muted = true;
                        document.body.appendChild(remoteVideo);
                        remoteVideo.srcObject = stream;
                    };
                    internalRemoteUsers[user] = remoteUser
                })
            }

            async function callUser(socketId: string) {
                const offer = await internalRemoteUsers[socketId].peerConnection.createOffer();
                await internalRemoteUsers[socketId].peerConnection.setLocalDescription(new RTCSessionDescription(offer));

                socket.emit("call-user", {
                    offer,
                    to: socketId
                });
            }

            function updateUserList(socketIds: string[]) {

                socketIds.forEach(socketId => {
                    if (socketId < socket.id) callUser(socketId)
                });
            }

            const socket = io.connect(`https://${window.location.hostname}:5000`);

            socket.on("update-user-list", async ({ users }: { users: string[] }) => {
                init(users);
                updateUserList(users);
            });

            socket.on("remove-user", ({ socketId }: { socketId: string }) => {
                const elToRemove = document.getElementById(socketId);

                if (elToRemove) {
                    elToRemove.remove();
                }
            });

            socket.on("connect", () => {
                setSocketId(socket.id);
            })

            socket.on("call-made", async (data: { socket: string, offer: RTCSessionDescriptionInit }) => {
                const socketId = data.socket;
                await internalRemoteUsers[socketId].peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.offer)
                );
                const answer = await internalRemoteUsers[socketId].peerConnection.createAnswer();
                await internalRemoteUsers[socketId].peerConnection.setLocalDescription(new RTCSessionDescription(answer));

                socket.emit("make-answer", {
                    answer,
                    to: data.socket
                });
                internalRemoteUsers[socketId].getCalled = true;
            });

            socket.on("answer-made", async (data: { socket: string, answer: RTCSessionDescriptionInit }) => {
                const socketId = data.socket
                await internalRemoteUsers[socketId].peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.answer)
                );

                if (!internalRemoteUsers[socketId].isAlreadyCalling) {
                    callUser(data.socket);
                    internalRemoteUsers[socketId].isAlreadyCalling = true;
                }
            });

            return socket
        }
        getSocket();
    }, [])

    return { remoteUsers, socketId };
}