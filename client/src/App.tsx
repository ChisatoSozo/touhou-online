import { Color4, Scene as BJSScene, Vector3 } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import '@babylonjs/loaders';
//@ts-ignore
import * as CANNON from 'cannon';
import React from 'react';
import { Scene } from 'react-babylonjs';
import { GameContainer } from './containers/GameContainer';
import { CannonJSPlugin } from './forks/CannonJSPlugin';
import Engine from './forks/Engine';
import { useWindowSize } from './hooks/useWindowSize';
import { BindControls } from './player/BindControls';
import { World } from './World';
const gravityVector = new Vector3(0, -9.81, 0);

window.CANNON = CANNON

const skyColor = new Color4(0.95, 0.95, 1.0, 1.0);
const skyColor3 = new Color3(0.95, 0.95, 1.0);

function App() {
    const windowSize = useWindowSize();

    return (
        <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
            <Scene fogMode={BJSScene.FOGMODE_EXP2} fogDensity={0.0005} fogColor={skyColor3} ambientColor={skyColor3} clearColor={skyColor} enablePhysics={[gravityVector, new CannonJSPlugin()]}>
                <directionalLight name="dl" intensity={0.5} direction={new Vector3(0, -1, 1)} position={new Vector3(0, 2, 0.5)}>
                    <shadowGenerator mapSize={1024} useBlurExponentialShadowMap blurKernel={32} shadowCastChildren>
                        <GameContainer xrEnabled={true}>
                            <BindControls />
                            <World />

                        </GameContainer>
                    </shadowGenerator>
                </directionalLight>
                <hemisphericLight name="light1" intensity={0.3} direction={Vector3.Up()} />

            </Scene>
        </Engine >
    );
}

export default App;
