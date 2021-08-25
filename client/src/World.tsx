import { AssetContainer, SceneLoader } from '@babylonjs/core';
import React, { useEffect, useState } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { useOnline } from './hooks/useOnline';
import { useRig } from './hooks/useRig';
import { PlayerAvatar } from './player/PlayerAvatar';
import { PlayerCamera } from './player/PlayerCamera';
import { PlayerMovement } from './player/PlayerMovement';
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
        SceneLoader.LoadAssetContainer('/avatars/Dude/', 'Dude.babylon', scene, function (container) {
            setContainer(container);
        });
    }, [scene]);

    return (
        <>
            <PlayerMovement>
                <PlayerCamera />
                <PlayerAvatar rig={rig} assetContainer={container} />
            </PlayerMovement>

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
