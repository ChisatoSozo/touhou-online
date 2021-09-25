import localstorage from 'local-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarMap } from '../protos/touhou_pb';
import Music from '../sounds/Music';
import * as SOUNDS from '../sounds/SFX';
import { QualityName } from '../utils/Constants';

export interface Score {
    name: string;
    score: number;
}


export interface ILS {
    //USER
    USERNAME: string;
    CHARACTER: AvatarMap[keyof AvatarMap];

    ///STATS
    HIGHEST_SCORE: number;
    CONTINUES_USED: number;
    DEATHS: number;
    BOMBS_USED: number;
    FRAMES_DROPPED: number;

    //Settings
    QUALITY: QualityName;
    SFX: 'ON' | 'OFF';
    MUSIC: 'ON' | 'OFF';
    INITIAL_PLAYER: number;
    INITIAL_BOMB: number;

    //Ingame numbers
    SCORE: number;
    POINT: number;
    PLAYER: number;
    BOMB: number;
    POWER: number;
    GRAZE: number;

    NEW_SCORE: number;
    HIGH_SCORES: Score[];
}

const defaultLS: () => ILS = () => ({
    //USER
    USERNAME: "ERROR",
    CHARACTER: Avatar.REIMU,

    ///STATS
    HIGHEST_SCORE: 10000,
    CONTINUES_USED: 0,
    DEATHS: 0,
    BOMBS_USED: 0,
    FRAMES_DROPPED: 0,

    //SETTINGS
    QUALITY: 'Hi',
    SFX: 'OFF',
    MUSIC: 'ON',
    INITIAL_PLAYER: 3,
    INITIAL_BOMB: 2,

    //Ingame numbers
    SCORE: 0,
    POINT: 0,
    PLAYER: 3,
    BOMB: 2,
    POWER: 0,
    GRAZE: 0,

    NEW_SCORE: 0,
    HIGH_SCORES: [
        {
            name: '--------',
            score: 10000,
        },
        {
            name: '--------',
            score: 9000,
        },
        {
            name: '--------',
            score: 8000,
        },
        {
            name: '--------',
            score: 7000,
        },
        {
            name: '--------',
            score: 6000,
        },
        {
            name: '--------',
            score: 5000,
        },
        {
            name: '--------',
            score: 4000,
        },
    ],
});

export const LS = {
    current: defaultLS()
};

const loadLS = () => {
    const loadedLS = JSON.parse(localstorage('LS') as unknown as string);
    if (!loadedLS) return;
    Object.assign(LS.current, loadedLS);
};
loadLS();

export const useLS = () => {
    const [stateUpdate, setStateUpdate] = useState<number>(0);

    const syncLS = useCallback(() => {
        if (LS.current.MUSIC === 'ON') {
            Music.play();
        }

        if (LS.current.MUSIC === 'OFF') {
            Music.stop();
        }

        if (LS.current.SFX === 'OFF') {
            for (const sound in SOUNDS) {
                //@ts-ignore
                if (SOUNDS[sound].stop) SOUNDS[sound].stop();
            }
        }
        localstorage('LS', JSON.stringify(LS.current));
    }, [])

    const setLS = useCallback((key: keyof ILS, value: ILS[keyof ILS], synchronous?: boolean) => {
        LS.current = { ...LS.current }
        //@ts-ignore
        LS.current[key] = value;
        setStateUpdate(stateUpdate => stateUpdate + 1);
        if (synchronous) syncLS()
    }, [syncLS])

    useEffect(() => {
        syncLS()
    }, [stateUpdate, syncLS])

    useMemo(() => loadLS(), []);
    return { setLS, LS: LS.current };
};