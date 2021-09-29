import { Color4, Scene as BJSScene, Vector3 } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import '@babylonjs/loaders';
//@ts-ignore
import * as CANNON from 'cannon';
import React, { useMemo, useState } from 'react';
import { Scene } from 'react-babylonjs';
import {
    BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import { GameContainer } from '../containers/GameContainer';
import { LS } from '../containers/LSContext';
import { ReducedGameContainer } from '../containers/ReducedGameContainer';
import { CannonJSPlugin } from '../forks/CannonJSPlugin';
import Engine from '../forks/Engine';
import { AttackEditorGUI } from '../gui/AttackEditorGUI';
import { useWindowSize } from '../hooks/useWindowSize';
import { Sun } from '../lights/Sun';
import { BindControls } from '../player/BindControls';
import { createRig, PLAYER_DATA_STORE, PLAYER_POSE_STORE } from '../player/PlayerPoseStore';
import { AttackState } from '../protos/touhou_pb';
import Music from '../sounds/Music';
import { PreBulletInstruction } from '../types/BulletTypes';
import { World } from '../world/World';
import { AttackEditor } from './AttackEditor';

const gravityVector = new Vector3(0, -9.81, 0);

window.CANNON = CANNON

const skyColor = new Color4(0.95, 0.95, 1.0, 1.0);
const skyColor3 = new Color3(0.95, 0.95, 1.0);

export const Game = () => {
    const windowSize = useWindowSize();
    const [attackEditorInstruction, setAttackEditorInstruction] = useState<PreBulletInstruction>({
        patternOptions: {
            pattern: 'burst',
            num: 300,
            speed: 2,
            radius: 0.5,
        },
        meshOptions: {
            mesh: 'sphere',
            radius: 0.3,
        },
        materialOptions: {
            material: 'fresnel',
            color: [0, 0, 1],
        },
        behaviourOptions: {
            behaviour: 'linear',
            rotationFromParent: true,
        },
        endTimingOptions: {
            timing: 'lifespan',
            disablePrecomputation: false,
            uid: '',
        },
        soundOptions: {
            mute: false,
            sound: 'enemyShoot',
            uid: '',
        },
        lifespan: 20,
    });

    useMemo(() => {
        PLAYER_POSE_STORE[LS.current.USERNAME] = createRig()
        PLAYER_DATA_STORE[LS.current.USERNAME] = {
            avatar: LS.current.CHARACTER,
            attackState: AttackState.NOT_ATTACKING
        }
        Music.stop()
    }, [])

    return (
        <Router>
            <Switch>
                <Route path="/game/attackEditor">
                    <AttackEditorGUI {...{ attackEditorInstruction, setAttackEditorInstruction }} />
                </Route>
            </Switch>
            <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
                <Scene fogMode={BJSScene.FOGMODE_EXP2} fogDensity={0.0005} fogColor={skyColor3} ambientColor={skyColor3} clearColor={skyColor} enablePhysics={[gravityVector, new CannonJSPlugin()]}>
                    <Router>
                        <Switch>
                            <Route path="/game/attackEditor">
                                <ReducedGameContainer>
                                    <AttackEditor attackEditorInstruction={attackEditorInstruction} />
                                </ReducedGameContainer>
                            </Route>
                            <Route path="/game">
                                <GameContainer xrEnabled={true}>
                                    <BindControls />
                                    <hemisphericLight name="light1" intensity={0.1} direction={Vector3.Up()} />
                                    <Sun>
                                        <World />
                                    </Sun>
                                </GameContainer>
                            </Route>
                        </Switch>
                    </Router>
                </Scene>
            </Engine >
        </Router>
    );
}
