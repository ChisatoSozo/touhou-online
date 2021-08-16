import { Color4, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';
import React from 'react';
import { Scene } from 'react-babylonjs';
import { GameContainer } from './containers/GameContainer';
import Engine from './forks/Engine';
import { useWindowSize } from './hooks/useWindowSize';
import { BindControls } from './player/BindControls';
import { Terrain } from './terrain/Terrain';
import { World } from './World';

function App() {
    const windowSize = useWindowSize();

    return (
        <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
            <Scene clearColor={new Color4(0.8, 0.8, 1.0, 1.0)}>
                <directionalLight name="dl" intensity={0.5} direction={new Vector3(0, -0.5, 0.5)} position={new Vector3(0, 2, 0.5)}>
                    <shadowGenerator mapSize={1024} useBlurExponentialShadowMap blurKernel={32} shadowCastChildren>
                        <GameContainer xrEnabled={true}>
                            <BindControls />
                            <World />
                        </GameContainer>
                    </shadowGenerator>
                </directionalLight>
                <hemisphericLight name="light1" intensity={0.3} direction={Vector3.Up()} />
                <Terrain />
                <ground receiveShadows position={new Vector3(0, -1, 0)} name="ground" width={100} height={100}>
                    <standardMaterial name="mat">
                        <texture assignTo="diffuseTexture" url="/assets/textures/grass.jpg" name="grass" />
                    </standardMaterial>
                </ground>
            </Scene>
        </Engine>
    );
}

export default App;
