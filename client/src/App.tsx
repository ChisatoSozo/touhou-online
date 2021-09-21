import { Color4, Scene as BJSScene, Vector3 } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import '@babylonjs/loaders';
//@ts-ignore
import * as CANNON from 'cannon';
import React, { useState } from 'react';
import { Scene } from 'react-babylonjs';
import {
    BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import { AttackEditor } from './AttackEditor';
import { GameContainer } from './containers/GameContainer';
import { ReducedGameContainer } from './containers/ReducedGameContainer';
import { CannonJSPlugin } from './forks/CannonJSPlugin';
import Engine from './forks/Engine';
import { AttackEditorGUI } from './gui/AttackEditorGUI';
import { useWindowSize } from './hooks/useWindowSize';
import { Sun } from './lights/Sun';
import { BindControls } from './player/BindControls';
import { PreBulletInstruction } from './types/BulletTypes';
import { World } from './World';

const gravityVector = new Vector3(0, -9.81, 0);

window.CANNON = CANNON

const skyColor = new Color4(0.95, 0.95, 1.0, 1.0);
const skyColor3 = new Color3(0.95, 0.95, 1.0);

function App() {
    const windowSize = useWindowSize();
    const [attackEditorInstruction, setAttackEditorInstruction] = useState<PreBulletInstruction>({
        patternOptions: {
            pattern: 'burst',
            num: 300,
            repeat: {
                times: 5,
                delay: 3,
            },
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

    return (
        <Router>
            <Switch>
                <Route path="/attackEditor">
                    <AttackEditorGUI {...{ attackEditorInstruction, setAttackEditorInstruction }} />
                </Route>
            </Switch>
            <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
                <Scene fogMode={BJSScene.FOGMODE_EXP2} fogDensity={0.0005} fogColor={skyColor3} ambientColor={skyColor3} clearColor={skyColor} enablePhysics={[gravityVector, new CannonJSPlugin()]}>
                    <Router>
                        <Switch>
                            <Route path="/attackEditor">
                                <ReducedGameContainer>
                                    <AttackEditor attackEditorInstruction={attackEditorInstruction} />
                                </ReducedGameContainer>
                            </Route>
                            <Route path="/">
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

export default App;
