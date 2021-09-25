import React from 'react';
import { PlayerCamera } from './PlayerCamera';
import { PlayerMovement } from './PlayerMovement';
export type MovementState = "walking" | "falling" | "floating" | "flying";

export const Player = () => {
    return (
        <>
            <PlayerMovement />
            <PlayerCamera />
        </>
    )
}
