import { TransformNode } from '@babylonjs/core';
import React, { useRef } from 'react';
import { PlayerCamera } from './PlayerCamera';
import { PlayerMovement } from './PlayerMovement';
export type MovementState = "walking" | "falling" | "floating" | "flying";

export const Player = () => {
    const head = useRef<TransformNode>();

    return (
        <PlayerMovement head={head}>
            <PlayerCamera head={head} />
            {/* <PlayerAvatar rig={rig} assetContainer={container} /> */}
        </PlayerMovement>
    )
}
