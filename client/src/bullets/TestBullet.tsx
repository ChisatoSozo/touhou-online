import { TransformNode } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import React, { useEffect, useRef } from 'react';
import { useAddBulletGroup, useDisposeBulletGroup } from '../hooks/useAddBulletGroup';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { PreBulletInstruction } from '../types/BulletTypes';
import { DeepPartial } from '../types/UtilTypes';

interface AttackEditorProps {
    instruction: DeepPartial<PreBulletInstruction>
}

export const testInstruction: DeepPartial<PreBulletInstruction> = {
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
}

export const TestBullet: React.FC<AttackEditorProps> = ({ instruction }) => {
    const addBulletGroup = useAddBulletGroup();
    const disposeBulletGroup = useDisposeBulletGroup()
    const transformNodeRef = useRef<TransformNode>();
    useEffect(() => {
        if (!transformNodeRef.current) return;
        if (!addBulletGroup) return;
        const bulletId = addBulletGroup(transformNodeRef.current, instruction);
        return () => {
            disposeBulletGroup([bulletId])
        }
    }, [addBulletGroup, instruction, disposeBulletGroup]);

    useDeltaBeforeRender((scene, deltaS) => {
        if (!transformNodeRef.current) return;
        transformNodeRef.current.rotation.x += deltaS * 0.3 * 4;
        transformNodeRef.current.rotation.y += deltaS * 0.3 * 2.646;
        transformNodeRef.current.rotation.z += deltaS * 0.3 * 1.2222;
    });

    return (
        <transformNode position={new Vector3(0, 220, 0)} name="test" ref={transformNodeRef} />
    )
}
