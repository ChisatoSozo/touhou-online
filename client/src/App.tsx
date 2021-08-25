import { CannonJSPlugin, Color4, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';
//@ts-ignore
import * as CANNON from 'cannon';
import React from 'react';
import { Scene } from 'react-babylonjs';
import { GameContainer } from './containers/GameContainer';
import Engine from './forks/Engine';
import { useWindowSize } from './hooks/useWindowSize';
import { BindControls } from './player/BindControls';
import { Terrain } from './terrain/Terrain';
import { ENABLE_PHYSICS } from './utils/Switches';
import { World } from './World';
const gravityVector = new Vector3(0, -9.81, 0);

window.CANNON = CANNON

function App() {
    const windowSize = useWindowSize();

    return (
        <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
            <Scene clearColor={new Color4(0.8, 0.8, 1.0, 1.0)} enablePhysics={ENABLE_PHYSICS ? [gravityVector, new CannonJSPlugin()] : undefined}>
                <directionalLight name="dl" intensity={1} direction={new Vector3(0, -0.5, 0.5)} position={new Vector3(0, 2, 0.5)}>
                    <shadowGenerator mapSize={1024} useBlurExponentialShadowMap blurKernel={32} shadowCastChildren>
                        <GameContainer xrEnabled={true}>
                            <BindControls />
                            <World />
                            <Terrain />
                        </GameContainer>
                    </shadowGenerator>
                </directionalLight>
                <hemisphericLight name="light1" intensity={0.3} direction={Vector3.Up()} />

            </Scene>
        </Engine>
    );
}

export default App;
