import { Scalar } from '@babylonjs/core';
import React, { useCallback, useEffect, useState } from 'react';
import { useAfterRender, useBeforeRender } from 'react-babylonjs';
import { movementStateRef } from '../player/PlayerMovement';
import { modDist, modRange } from '../utils/MathUtils';

const defaultKeyMap = {
    27: 'MENU',
    13: 'ENTER',
    40: 'BACK', //Down arrow
    83: 'BACK', //s
    38: 'FORWARD', //Up arrow
    87: 'FORWARD', //w
    37: 'LEFT', //left arrow
    65: 'LEFT', //a
    69: 'UP', //e
    81: 'DOWN', //q
    39: 'RIGHT', //right arrow
    68: 'RIGHT', //d
    16: 'CROUCH', //shift
    32: 'JUMP', //space
    1: 'SHOOT', //click
    3: 'STRONG_SHOOT', //right-click
    80: 'DIALOGUE', //p
};

interface KeyDown {
    lookX: number;
    lookY: number;
    [key: string]: boolean | number;
}
interface KeyMap {
    [key: number]: string;
}

const makeDefaultDownKeyMap = () => {
    const keys = new Set(Object.values(defaultKeyMap));
    const downKeyMap: KeyDown = {
        lookX: 0,
        lookY: 0
    };
    keys.forEach((key) => {
        downKeyMap[key] = false;
    });
    return downKeyMap;
};

interface KeyObject {
    keyDeltas: KeyDown;
    lastMetaDownKeys: KeyDown
    metaDownKeys: KeyDown;
    disabledMap: KeyDown;
}

export const keyObject: KeyObject = {
    keyDeltas: makeDefaultDownKeyMap(),
    lastMetaDownKeys: makeDefaultDownKeyMap(),
    metaDownKeys: makeDefaultDownKeyMap(),
    disabledMap: {
        lookX: 0,
        lookY: 0
    },
};

export interface DanmakuControlEvent {
    which: number;
}

export interface DanmakuPointerEvent {
    movementX: number;
    movementY: number;
}

export interface IControlsContext {
    keyMap: KeyMap;
    setKeyMap: (keyMap: KeyMap) => void;
    downKeys: KeyDown;
    keyDownHandler: (event: DanmakuControlEvent) => void;
    keyUpHandler: (event: DanmakuControlEvent) => void;
    lookMoveHandler: (event: DanmakuPointerEvent) => void;
    disableControl: (control: string) => void;
    enableControl: (control: string) => void;
    setTyping: (typing: boolean) => void;
    setDisabled: (disabled: boolean) => void;
}

const defaultControlsContext: IControlsContext = {
    keyMap: {},
    setKeyMap: () => {
        return;
    },
    downKeys: {
        lookX: 0,
        lookY: 0
    },
    keyDownHandler: () => {
        return;
    },
    keyUpHandler: () => {
        return;
    },
    lookMoveHandler: () => {
        return;
    },
    disableControl: () => {
        return;
    },
    enableControl: () => {
        return;
    },
    setTyping: () => {
        return;
    },
    setDisabled: () => {
        return;
    },
};

export const ControlsContext = React.createContext(defaultControlsContext);

export const useControlsContext = (outsideOfRenderer: boolean) => {
    const [downKeys, setDownKeys] = useState<KeyDown>({
        lookX: 0,
        lookY: 0
    });
    const [typing, setTyping] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [keyMap, setKeyMap] = useState<KeyMap>(defaultKeyMap);

    const keyDownHandler = useCallback(
        (event: DanmakuControlEvent) => {
            if (disabled) return;
            if (!(event.which in keyMap)) {
                return;
            }
            const key = keyMap[event.which];

            if (typing && !['ENTER', 'MENU'].includes(key)) return;

            if (keyObject.metaDownKeys[key]) return;
            if (keyObject.disabledMap[key]) return;

            const newMetaDownKeys = { ...keyObject.metaDownKeys };
            newMetaDownKeys[key] = true;

            keyObject.metaDownKeys = newMetaDownKeys;
        },
        [disabled, keyMap, typing],
    );

    const keyUpHandler = useCallback(
        (event) => {
            if (disabled) return;
            if (!(event.which in keyMap)) {
                return;
            }

            const key = keyMap[event.which];

            if (typing && !['ENTER', 'MENU'].includes(key)) return;

            if (!keyObject.metaDownKeys[key]) return;

            const newMetaDownKeys = { ...keyObject.metaDownKeys };
            newMetaDownKeys[key] = false;
            keyObject.metaDownKeys = newMetaDownKeys;
        },
        [disabled, keyMap, typing],
    );

    const lookMoveHandler = useCallback((event) => {
        if (event.movementX === undefined || event.movementY === undefined) throw new Error("Recieved look event with no data")
        const newMetaDownKeys = { ...keyObject.metaDownKeys };
        newMetaDownKeys["lookX"] += event.movementX / window.innerWidth;
        newMetaDownKeys["lookY"] += event.movementY / window.innerHeight;
        newMetaDownKeys["lookX"] = modRange(newMetaDownKeys["lookX"], -1, 1)
        newMetaDownKeys["lookY"] = movementStateRef.current === "flying" ? modRange(newMetaDownKeys["lookY"], -1, 1) : Scalar.Clamp(newMetaDownKeys["lookY"], -1, 1)
        keyObject.metaDownKeys = newMetaDownKeys;
    }, [])

    const keySync = useCallback(() => {
        setDownKeys(keyObject.metaDownKeys);
    }, [setDownKeys]);

    const disableControl = useCallback((control: string) => {
        keyObject.disabledMap[control] = true;
    }, []);

    const enableControl = useCallback((control: string) => {
        delete keyObject.disabledMap[control];
    }, []);

    useEffect(() => {
        if (!outsideOfRenderer) return;

        const timerID = window.setInterval(keySync, 16);

        return () => {
            window.clearInterval(timerID);
        };
    }, [outsideOfRenderer, keySync]);

    useBeforeRender(() => {
        setDownKeys(keyObject.metaDownKeys);
    });

    useAfterRender(() => {
        for (const key in keyObject.metaDownKeys) {
            if (["lookY", "lookX"].includes(key)) {
                keyObject.keyDeltas[key] = modDist(+keyObject.lastMetaDownKeys[key] + 1, +keyObject.metaDownKeys[key] + 1, 2);
            }
            else {
                keyObject.keyDeltas[key] = (+keyObject.metaDownKeys[key]) - (+keyObject.lastMetaDownKeys[key])
            }

        }
        keyObject.lastMetaDownKeys = { ...keyObject.metaDownKeys }
    })

    return {
        keyMap,
        setKeyMap,
        downKeys,
        keyDownHandler,
        keyUpHandler,
        lookMoveHandler,
        disableControl,
        enableControl,
        setTyping,
        setDisabled,
    };
};
