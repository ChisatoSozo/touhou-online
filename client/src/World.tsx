import React from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { useOnline } from './hooks/useOnline';
import { useSolveWorldState } from './hooks/useSolveWorldState';
import { Player } from './player/Player';
import { PlayerAvatar } from './player/PlayerAvatar';
import { PLAYER_POSE_STORE } from './player/PlayerPoseStore';
import { Terrain } from './terrain/Terrain';
import { protoRig } from './utils/ProtoUtils';
import { username } from './utils/TempConst';

export const World = () => {
    const { sendUpdate, worldState } = useOnline(`http://${window.location.hostname}:8080`, username.current);
    // const scene = useScene();
    // const [container, setContainer] = useState<AssetContainer>();

    useBeforeRender(() => {
        sendUpdate(protoRig(PLAYER_POSE_STORE[username.current]));
    });
    useSolveWorldState(worldState)

    // useEffect(() => {
    //     //INIT WORLD
    //     if (!scene) return;
    //     SceneLoader.LoadAssetContainer('/avatars/Dude/', 'Dude.babylon', scene, function (container) {
    //         setContainer(container);
    //     });
    // }, [scene]);

    return (
        <>
            <Player />
            <Terrain />
            {Object.keys(PLAYER_POSE_STORE).map(
                (player) => <PlayerAvatar key={player} username={player} />
            )}
        </>
    );
};
