import { AssetContainer, SceneLoader } from '@babylonjs/core';
import React, { useEffect, useState } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { useOnline } from './hooks/useOnline';
import { useRig } from './hooks/useRig';
import { Player } from './player/Player';
import { PlayerAvatar } from './player/PlayerAvatar';
import { protoRig } from './utils/ProtoUtils';

const username = [Math.random(), Math.random(), Math.random()].join(',');

export const World = () => {
    const { sendUpdate, worldState } = useOnline(`http://${window.location.hostname}:8080`, username);
    const rig = useRig();
    const scene = useScene();
    const [container, setContainer] = useState<AssetContainer>();

    useBeforeRender(() => {
        sendUpdate(protoRig(rig.current));
    });

    useEffect(() => {
        //INIT WORLD
        if (!scene) return;
        SceneLoader.LoadAssetContainer('/avatars/Dude/', 'Dude.babylon', scene, function (container) {
            setContainer(container);
        });
    }, [scene]);

    return (
        <>
            <Player />
            {worldState &&
                worldState.playersList.map(
                    (player) =>
                        player.username !== username && (
                            <PlayerAvatar key={player.username} state={player} assetContainer={container} />
                        ),
                )}
        </>
    );
};
