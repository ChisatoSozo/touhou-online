export const getAudio = () => {
    return new Promise<[MediaStreamTrack[], MediaStream]>((resolve, reject) => {
        navigator.getUserMedia(
            { video: false, audio: true },
            stream => {
                resolve([stream.getTracks(), stream])
            },
            error => {
                reject(error.message);
            }
        );
    })
}