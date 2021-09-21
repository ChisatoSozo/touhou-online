import { TransformNode } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import React, { useEffect, useRef } from 'react';
import { useAddBulletGroup, useDisposeBulletGroup } from './hooks/useAddBulletGroup';
import { useDeltaBeforeRender } from './hooks/useDeltaBeforeRender';
import { SkyBox } from './terrain/SkyBox';
import { PreBulletInstruction } from './types/BulletTypes';
import { DeepPartial } from './types/UtilTypes';

interface AttackEditorProps {
    attackEditorInstruction: DeepPartial<PreBulletInstruction>

}

export const AttackEditor: React.FC<AttackEditorProps> = ({ attackEditorInstruction }) => {
    const addBulletGroup = useAddBulletGroup();
    const disposeBulletGroup = useDisposeBulletGroup()
    const transformNodeRef = useRef<TransformNode>();
    useEffect(() => {
        if (!transformNodeRef.current) return;
        if (!addBulletGroup) return;
        // addBulletGroup(transformNodeRef.current, {
        //     patternOptions: {
        //         num: 5,
        //         repeat: {
        //             times: 5000,
        //             delay: 0.02,
        //         },
        //         speed: 0.001,
        //         radius: 0.5,
        //     },
        //     meshOptions: {
        //         mesh: 'laser',
        //         radius: 0.1,
        //         laserLength: 40,
        //     },
        //     materialOptions: {
        //         material: 'laser',
        //         color: [1, 0, 0],
        //         glow: false,
        //     },
        //     behaviourOptions: {
        //         behaviour: 'linearLaser',
        //         rotationFromParent: true,
        //     },
        //     endTimingOptions: {
        //         timing: 'uniform',
        //         time: 2,
        //     },
        //     lifespan: 50,
        // });
        const bulletId = addBulletGroup(transformNodeRef.current, attackEditorInstruction);
        return () => {
            disposeBulletGroup([bulletId])
        }

    }, [addBulletGroup, attackEditorInstruction, disposeBulletGroup]);

    useDeltaBeforeRender((scene, deltaS) => {
        if (!transformNodeRef.current) return;
        transformNodeRef.current.rotation.x += deltaS * 0.3 * 4;
        transformNodeRef.current.rotation.y += deltaS * 0.3 * 2.646;
        transformNodeRef.current.rotation.z += deltaS * 0.3 * 1.2222;
    });

    return (
        <>
            <arcRotateCamera name='arc' target={new Vector3(0, 0, 0)}
                alpha={-Math.PI / 2} beta={(0.5 + (Math.PI / 4))}
                radius={2} minZ={0.1} maxZ={10000} wheelPrecision={50}
                panningDistanceLimit={0.0001} />

            <directionalLight name='dl' direction={new Vector3(0, -0.5, 0.5)} position={new Vector3(0, 2, 0.5)} />
            <hemisphericLight name='hl' intensity={0.3} direction={new Vector3(0, -1, 0)} />
            <SkyBox />
            <transformNode position={new Vector3(0, 0.0001, 0)} name="test" ref={transformNodeRef}></transformNode>;
        </>
    )
}
