
//@ts-ignore
import io from "socket.io-client";
import { getAudio } from "./getAudio";

interface UserData {
    called: boolean;
    peerConnection: RTCPeerConnection;
}

interface Users {
    [socketId: string]: UserData;
}

export const setupSockets = async () => {
    const [tracks, stream] = await getAudio()

    const socket = io(`https://${window.location.hostname}:5000`);
    socket.connect();

    const users: Users = {};

    const newStream = (e: RTCTrackEvent) => {
        console.log("NEW STREAMS", e)
        const audioEl = document.getElementById("remote-video") as HTMLVideoElement;

        audioEl.srcObject = e.streams[0];
    };

    const callUser = async (user: string) => {
        console.log("CALLING " + user)
        const offer = await users[user].peerConnection.createOffer({
            offerToReceiveVideo: false,
            offerToReceiveAudio: true
        });
        users[user].called = true

        await users[user].peerConnection.setLocalDescription(new RTCSessionDescription(offer));

        socket.emit("call-user", {
            offer,
            to: user
        });

    }

    socket.on('update-user-list', ({ users: newUsers }: { users: string[] }) => {
        newUsers.forEach(user => {
            if (!(user in users)) {
                users[user] = {
                    called: false,
                    peerConnection: new RTCPeerConnection()
                };

                tracks.forEach(track => users[user].peerConnection.addTrack(track, stream))
                //@ts-ignore
                users[user].peerConnection.ontrack = newStream


                if (socket.id > user) callUser(user);
            }
        })
    });

    socket.on("call-made", async (data: { socket: string, offer: RTCSessionDescriptionInit }) => {
        const user = data.socket;
        console.log("GETTING CALL FROM " + user)
        await users[user].peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer)
        );
        const answer = await users[user].peerConnection.createAnswer({
            offerToReceiveVideo: false,
            offerToReceiveAudio: true
        });
        await users[user].peerConnection.setLocalDescription(new RTCSessionDescription(answer));

        console.log("ANSWERING " + user)

        socket.emit("make-answer", {
            answer,
            to: data.socket
        });
    });

    socket.on("answer-made", async (data: { socket: string, answer: RTCSessionDescriptionInit }) => {
        const user = data.socket;
        console.log("GETTING ANSWER FROM " + user)
        await users[user].peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.answer)
        );
    });
}